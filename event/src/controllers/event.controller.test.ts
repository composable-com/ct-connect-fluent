import { Request, Response } from 'express'
import { post } from './event.controller' // adjust the path

import { logger } from '../utils/logger.utils'
import { fluentLogin } from '../fluent/client'
import { getFluentOrder, getFluentStandardProduct } from '../fluent/utils'
import {
  createStandardProduct,
  createVariantProduct,
  getCustomerByRef,
} from '../fluent/api'

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

jest.mock('../client/create.client', () => {
  return {
    createApiRoot: jest.fn().mockImplementation(() => ({
      customers: jest.fn().mockReturnValue({
        withId: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest.fn(),
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
})
