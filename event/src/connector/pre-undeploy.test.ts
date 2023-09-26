import { createStandardProduct, createVariantProduct } from '../fluent/api'
import { fluentLogin } from '../fluent/client'
import { getFluentStandardProduct } from '../fluent/utils'

import { deleteMySubscription } from './actions'

import { preUndeploy, run } from './pre-undeploy'

jest.mock('../utils/assert.utils')
jest.mock('./actions')
jest.mock('../fluent/client')
jest.mock('../client/create.client', () => {
  return {
    createApiRoot: jest.fn().mockImplementation(() => ({
      products: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue({
          execute: jest.fn().mockReturnValue({
            body: {
              results: [
                {
                  masterData: {
                    current: {
                      name: {
                        'en-US': 'mockProduct',
                      },
                      masterVariant: { sku: 'mockSku123' },
                      variants: [{ sku: 'mockSku124' }],
                    },
                  },
                  key: 'mockKey',
                },
              ],
            },
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
jest.mock('../fluent/utils', () => ({
  getFluentStandardProduct: jest.fn().mockReturnValue({ name: 'mockProduct' }),
  getFluentProductVariant: jest.fn(),
  getFluentCategoriesFromCTCategories: jest.fn(),
  getFluentCustomer: jest.fn(),
  getFluentOrder: jest.fn(),
  getFluentTransaction: jest.fn(),
  getProductFluentCategories: jest.fn(),
}))
jest.mock('../fluent/api')
jest.mock('../utils/logger.utils', () => {
  return {
    logger: {
      info: jest.fn().mockReturnValue(''),
      error: jest.fn().mockReturnValue(''),
    },
  }
})

describe('pre-undeploy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('should delete subscription', async () => {
    await preUndeploy()

    expect(deleteMySubscription).toHaveBeenCalled()
  })
})

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  it('should delete subscription', async () => {
    await run()

    expect(deleteMySubscription).toHaveBeenCalled()
  })

  it('should login to fluent', async () => {
    await run()

    expect(fluentLogin).toHaveBeenCalled()
  })
  it('should loop through ct products and create in fluent', async () => {
    await run()

    expect(getFluentStandardProduct).toHaveBeenCalledWith({
      productName: 'mockProduct',
      productDescription: undefined,
      productKey: 'mockKey',
      productCategories: [],
    })
    expect(createStandardProduct).toHaveBeenCalledWith({ name: 'mockProduct' })
    expect(createVariantProduct).toHaveBeenCalled()
  })
})
