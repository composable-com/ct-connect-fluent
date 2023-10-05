import { Request, Response } from 'express'
import { post } from './event.controller' // adjust the path

import { logger } from '../utils/logger.utils'
import { fluentLogin } from '../fluent/client'
import { getFluentOrder, getFluentStandardProduct } from '../fluent/utils'
import { createOrder, createOrderAndCustomer, createFinancialTransaction, getCustomerByRef } from '../fluent/api'
import { createApiRoot } from '../client/create.client'

jest.mock('axios')
jest.mock('../fluent/client', () => ({
  FluentClient: jest.fn(),
  fluentLogin: jest.fn(),
  fluentGraphQL: jest.fn(),
}))
jest.mock('../fluent/utils', () => ({
  getFluentStandardProduct: jest.fn().mockReturnValue({ name: 'mockProduct' }),
  getFluentProductVariant: jest.fn(),
  getFluentCategoriesFromCTCategories: jest.fn(),
  getFluentCustomer: jest.fn(),
  getFluentOrder: jest.fn(),
  getFluentTransaction: jest.fn(),
  getProductFluentCategories: jest.fn(),
}))

jest.mock('../fluent/api', () => ({
  createFinancialTransaction: jest.fn(),
  createOrder: jest.fn(),
  createOrderAndCustomer: jest.fn(),
  createStandardProduct: jest.fn().mockReturnValue({}),
  createVariantProduct: jest.fn(),
  getCustomerByRef: jest
    .fn()
    .mockResolvedValue({ data: { customer: { id: '123' } } }),
}))

jest.mock('../client/create.client', () => {
  return {
    createApiRoot: jest.fn().mockImplementation(() => ({
      customers: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValueOnce({
              body: {
                id: 'some-customer-id',
              },
            }),
          }),
        }),
      }),
      payments: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest.fn(),
          }),
        }),
      }),
    })),
  }
})

jest.mock('../utils/logger.utils', () => ({
  logger: {
    info: jest.fn().mockReturnValue(''),
    error: jest.fn().mockReturnValue(''),
  },
}))

describe('post function', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  // const mockCreateStandardProduct = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }
  })

  it('should handle ProductPublished type correctly', async () => {
    const fakeData = {
      type: 'ProductPublished',
      productProjection: {
        key: 'some-key',
        name: { 'en-US': 'Some Product Name' },
        description: { 'en-US': 'Some Product Description' },
        variants: [],
        masterVariant: { sku: 'some-sku' },
      },
    }

    mockRequest.body = { message: { data: Buffer.from(JSON.stringify({ data: fakeData })) } }

    await post(mockRequest as Request, mockResponse as Response)

    expect(logger.info).toHaveBeenCalledWith('Event received')
    expect(fluentLogin).toHaveBeenCalled()
    expect(getFluentStandardProduct).toHaveBeenCalled()
  })

  it('should handle OrderCreated type correctly', async () => {
    const fakeData = {
      type: 'OrderCreated',
      order: {
        id: '123',
        orderNumber: '123',
        version: 1,
        createdAt: '2021-01-01T00:00:00.000Z',
        lastModifiedAt: '2021-01-01T00:00:00.000Z',
        customerId: '123',
        customerEmail: 'john.doe@gmail.com'
      },
    }

    mockRequest.body = { message: { data: Buffer.from(JSON.stringify({ data: fakeData })) } }

    await post(mockRequest as Request, mockResponse as Response)

    expect(logger.info).toHaveBeenCalledWith('Event received')
    expect(fluentLogin).toHaveBeenCalled()
  })

  it('should handle OrderCreated type correctly', async () => {
    const fakeData = {
      type: 'OrderCreated',
      order: {
        id: 'some-id',
        customerEmail: 'test@example.com',
        customerId: 'some-customer-id',
        paymentInfo: {
          payments: [
            {
              id: 'some-payment-id',
            },
          ],
        },
      },
    };

    mockRequest.body = { message: { data: Buffer.from(JSON.stringify({ data: fakeData })) } };

    (getCustomerByRef as jest.Mock).mockResolvedValueOnce({ data: { customer: { id: '123' } } });

    const mockCreateOrderResponse = {
      data: {
        createOrder: {
          id: 'some-order-id',
        },
      },
    };
    (createOrder as jest.Mock).mockResolvedValueOnce(mockCreateOrderResponse);

    await post(mockRequest as Request, mockResponse as Response);

    expect(logger.info).toHaveBeenCalledWith('Event received');
    expect(fluentLogin).toHaveBeenCalled();
    expect(getFluentOrder).toHaveBeenCalledWith(fakeData.order, Number('123'));
    expect(createOrder).toHaveBeenCalled();
  });

  it('should handle OrderCreated type correctly when order does not have customerEmail or customerId', async () => {
    const fakeData = {
      type: 'OrderCreated',
      order: {
        id: 'some-id',
      },
    };

    mockRequest.body = { message: { data: Buffer.from(JSON.stringify({ data: fakeData })) } };

    await post(mockRequest as Request, mockResponse as Response);

    expect(logger.info).toHaveBeenCalledWith('Event received');
    expect(fluentLogin).toHaveBeenCalled();
    expect(getFluentOrder).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
    expect(createOrderAndCustomer).not.toHaveBeenCalled();
    expect(createFinancialTransaction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
  });

  it('should handle unknown type correctly', async () => {
    const fakeData = {
      type: 'UnknownType',
    };

    mockRequest.body = { message: { data: Buffer.from(JSON.stringify({ data: fakeData })) } };

    await post(mockRequest as Request, mockResponse as Response);

    expect(logger.info).toHaveBeenCalledWith('Event received');
    expect(fluentLogin).toHaveBeenCalled();
    expect(getFluentOrder).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
    expect(createOrderAndCustomer).not.toHaveBeenCalled();
    expect(createFinancialTransaction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
  })

  it('should handle error correctly', async () => {
    const fakeError = new Error('Test error');
    mockRequest.body = { message: { data: Buffer.from(JSON.stringify({ data: {} })) } };
    (fluentLogin as jest.Mock).mockRejectedValueOnce(fakeError);

    await post(mockRequest as Request, mockResponse as Response);

    expect(logger.info).toHaveBeenCalledWith('Event received');
    expect(fluentLogin).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalled();
  });



})
