import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder'
import {
  PRODUCT_PUBLISHED_SUBSCRIPTION_KEY,
  createProductPublishedSubscription,
  deleteProductPublishedSubscription,
} from './actions'

describe('createProductPublishedSubscription', () => {
  let mockDeletefn: typeof jest.fn
  let mockPostfn: typeof jest.fn
  let mockApiRoot: ByProjectKeyRequestBuilder

  const mockGetResponse = {
    body: {
      results: [{ version: 1 }],
    },
  }

  beforeEach(() => {
    mockDeletefn = jest.fn().mockReturnThis()
    mockPostfn = jest.fn().mockReturnThis()
    mockApiRoot = {
      subscriptions: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      withKey: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(mockGetResponse),
      delete: mockDeletefn,
      post: mockPostfn,
    } as unknown as ByProjectKeyRequestBuilder
  })

  it('should delete an existing subscription if one exists', async () => {
    await createProductPublishedSubscription(
      mockApiRoot,
      'topicName',
      'projectId'
    )

    expect(mockDeletefn).toHaveBeenCalledWith({
      queryArgs: { version: 1 },
    })
    expect(mockPostfn).toHaveBeenCalledWith({
      body: {
        key: PRODUCT_PUBLISHED_SUBSCRIPTION_KEY,
        destination: {
          projectId: 'projectId',
          topic: 'topicName',
          type: 'GoogleCloudPubSub',
        },
        messages: [
          {
            resourceTypeId: 'product',
            types: ['ProductPublished'],
          },
        ],
      },
    })
  })
  it('should POST with expected body', async () => {
    await createProductPublishedSubscription(
      mockApiRoot,
      'topicName',
      'projectId'
    )

    expect(mockPostfn).toHaveBeenCalledWith({
      body: {
        key: PRODUCT_PUBLISHED_SUBSCRIPTION_KEY,
        destination: {
          projectId: 'projectId',
          topic: 'topicName',
          type: 'GoogleCloudPubSub',
        },
        messages: [
          {
            resourceTypeId: 'product',
            types: ['ProductPublished'],
          },
        ],
      },
    })
  })
})

describe('deleteProductPublishedSubscription', () => {
  let mockDeletefn: typeof jest.fn
  let mockApiRoot: ByProjectKeyRequestBuilder

  const mockGetResponse = {
    body: {
      results: [{ version: 1 }],
    },
  }

  beforeEach(() => {
    mockDeletefn = jest.fn().mockReturnThis()
    mockApiRoot = {
      subscriptions: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      withKey: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(mockGetResponse),
      delete: mockDeletefn,
    } as unknown as ByProjectKeyRequestBuilder
  })

  it('should delete a subscription', async () => {
    await deleteProductPublishedSubscription(mockApiRoot)

    expect(mockDeletefn).toHaveBeenCalledWith({
      queryArgs: { version: 1 },
    })
  })
})
