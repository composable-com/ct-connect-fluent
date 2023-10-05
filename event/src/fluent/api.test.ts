jest.mock('./client')
jest.mock('axios')

jest.mock('./client', () => ({
  FluentClient: {
    post: jest.fn(),
  },
  fluentGraphQL: jest.fn(),
}))

process.env.FLUENT_HOST = 'https://mockhost.com'

describe('createCategory', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should call createCategory with expected params', async () => {
    const mockCategory = { name: 'mockCategory' } as FluentCategory
    ;(FluentClient.post as jest.Mock).mockResolvedValue('success')

    const response = await createCategory(mockCategory)

    expect(FluentClient.post).toHaveBeenCalledWith(
      `${process.env.FLUENT_HOST}/api/v4.1/event/async`,
      mockCategory
    )

    expect(FluentClient.post).toHaveBeenCalledTimes(1)
    expect(response).toBe('success')
  })

  it('should call createStandardProduct with expected params', async () => {
    const mockProduct = {
      attributes: { name: 'mockName' },
    } as FluentStandardProduct
    ;(FluentClient.post as jest.Mock).mockResolvedValue('success')

    const response = await createStandardProduct(mockProduct)

    expect(FluentClient.post).toHaveBeenCalledWith(
      `${process.env.FLUENT_HOST}/api/v4.1/event/sync`,
      mockProduct
    )

    expect(FluentClient.post).toHaveBeenCalledTimes(1)
    expect(response).toBe('success')
  })
  it('should call createVariantProduct with expected params', async () => {
    const mockProduct = {
      attributes: { name: 'mockName' },
    } as FluentVariantProduct
    ;(FluentClient.post as jest.Mock).mockResolvedValue('success')

    const response = await createVariantProduct(mockProduct)

    expect(FluentClient.post).toHaveBeenCalledWith(
      `${process.env.FLUENT_HOST}/api/v4.1/event/async`,
      mockProduct
    )
    expect(FluentClient.post).toHaveBeenCalledTimes(1)
    expect(response).toBe('success')
  })
  it('should call createOrderAndCustomer with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockInput = {
      ref: 'mockOrderInput',
    } as unknown as GraphQlInput<CreateOrderAndCustomerInput>

    createOrderAndCustomer(mockInput)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe('mockOrderInput')
  })
  it('should call createOrder with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockInput = {
      ref: 'mockOrderInput',
      customerRef: 'mockCustomerRef',
      items: [
        {
          productRef: 'mockProductRef',
          quantity: 1,
        },
      ],
    } as unknown as GraphQlInput<CreateOrderInput>

    createOrder(mockInput)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe('mockOrderInput')
    expect(params.variables.customerRef).toBe('mockCustomerRef')
    expect(params.variables.items[0].productRef).toBe('mockProductRef')
    expect(params.variables.items[0].quantity).toBe(1)
  })
  it('should call createFinancialTransaction with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockInput = {
      ref: 'mockRef',
      type: 'mockType',
      workflowRef: 'mockWorkflowRef',
      workflowVersion: 'mockWorkflowVersion',
      total: 100,
      currency: 'USD',
      externalTransactionCode: 'mockExternalTransactionCode',
      externalTransactionId: 'mockExternalTransactionId',
      cardType: 'mockCardType',
      paymentMethod: 'mockPaymentMethod',
      paymentProviderName: 'mockPaymentProviderName',
    } as unknown as GraphQlInput<CreateFinancialTransactionInput>

    createFinancialTransaction(mockInput)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe('mockRef')
    expect(params.variables.type).toBe('mockType')
    expect(params.variables.workflowRef).toBe('mockWorkflowRef')
    expect(params.variables.workflowVersion).toBe('mockWorkflowVersion')
    expect(params.variables.total).toBe(100)
    expect(params.variables.currency).toBe('USD')
    expect(params.variables.externalTransactionCode).toBe('mockExternalTransactionCode')
    expect(params.variables.externalTransactionId).toBe('mockExternalTransactionId')
    expect(params.variables.cardType).toBe('mockCardType')
    expect(params.variables.paymentMethod).toBe('mockPaymentMethod')
    expect(params.variables.paymentProviderName).toBe('mockPaymentProviderName')
  })
  it('should call getCustomerByRef with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockRef = 'mockRef'

    getCustomerByRef(mockRef)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe(mockRef)
  })
})

import {
  createCategory,
  createFinancialTransaction,
  createOrder,
  createOrderAndCustomer,
  createStandardProduct,
  createVariantProduct,
  getCustomerByRef,
} from './api'
import { FluentClient, fluentGraphQL } from './client'
import {
  CreateFinancialTransactionInput,
  CreateOrderAndCustomerInput,
  CreateOrderInput,
  FluentCategory,
  FluentStandardProduct,
  FluentVariantProduct,
  GraphQlInput,
} from './types'

jest.mock('./client')
jest.mock('axios')

jest.mock('./client', () => ({
  FluentClient: {
    post: jest.fn(),
  },
  fluentGraphQL: jest.fn(),
}))

describe('createCategory', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should call createCategory with expected params', async () => {
    const mockCategory = { name: 'mockCategory' } as FluentCategory
    ;(FluentClient.post as jest.Mock).mockResolvedValue('success')

    const response = await createCategory(mockCategory)

    expect(FluentClient.post).toHaveBeenCalledWith(
      `${process.env.FLUENT_HOST}/api/v4.1/event/async`,
      mockCategory
    )

    expect(FluentClient.post).toHaveBeenCalledTimes(1)
    expect(response).toBe('success')
  })

  it('should call createStandardProduct with expected params', async () => {
    const mockProduct = {
      attributes: { name: 'mockName' },
    } as FluentStandardProduct
    ;(FluentClient.post as jest.Mock).mockResolvedValue('success')

    const response = await createStandardProduct(mockProduct)

    expect(FluentClient.post).toHaveBeenCalledWith(
      `${process.env.FLUENT_HOST}/api/v4.1/event/sync`,
      mockProduct
    )

    expect(FluentClient.post).toHaveBeenCalledTimes(1)
    expect(response).toBe('success')
  })
  it('should call createVariantProduct with expected params', async () => {
    const mockProduct = {
      attributes: { name: 'mockName' },
    } as FluentVariantProduct
    ;(FluentClient.post as jest.Mock).mockResolvedValue('success')

    const response = await createVariantProduct(mockProduct)

    expect(FluentClient.post).toHaveBeenCalledWith(
      `${process.env.FLUENT_HOST}/api/v4.1/event/async`,
      mockProduct
    )
    expect(FluentClient.post).toHaveBeenCalledTimes(1)
    expect(response).toBe('success')
  })
  it('should call createOrderAndCustomer with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockInput = {
      ref: 'mockOrderInput',
    } as unknown as GraphQlInput<CreateOrderAndCustomerInput>

    createOrderAndCustomer(mockInput)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe('mockOrderInput')
  })
  it('should call createOrder with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockInput = {
      ref: 'mockOrderInput',
    } as unknown as GraphQlInput<CreateOrderInput>

    createOrder(mockInput)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe('mockOrderInput')
  })
  it('should call createFinancialTransaction with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockInput = {
      ref: 'mockFinancialTransactionInput',
    } as unknown as GraphQlInput<CreateFinancialTransactionInput>

    createFinancialTransaction(mockInput)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe('mockFinancialTransactionInput')
  })
  it('should call getCustomerByRef with expected params', async () => {
    ;(fluentGraphQL as jest.Mock).mockResolvedValue('success')
    const fluentMock = fluentGraphQL as jest.Mock

    const mockInput = 'mockCustomerRef'

    getCustomerByRef(mockInput)

    const params = fluentMock.mock.calls[0][0]

    expect(params.variables.ref).toBe(mockInput)
  })
})
