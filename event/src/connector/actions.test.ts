import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder'
import {
  MY_SUBSCRIPTION_KEY,
  createMySubscription,
  deleteMySubscription,
} from './actions'

describe('createMySubscription', () => {
  let mockDeletefn: typeof jest.fn
  let mockPostfn: typeof jest.fn
  let mockApiRoot: ByProjectKeyRequestBuilder

  const mockGetResponse = {
    body: {
      results: [{ version: 1 }],
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()

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
    await createMySubscription(mockApiRoot, 'topicName', 'projectId')

    expect(mockDeletefn).toHaveBeenCalledWith({
      queryArgs: { version: 1 },
    })
    expect(mockPostfn).toHaveBeenCalledWith({
      body: {
        key: MY_SUBSCRIPTION_KEY,
        destination: {
          projectId: 'projectId',
          topic: 'topicName',
          type: 'GoogleCloudPubSub',
        },
        format: {
          type: 'CloudEvents',
          cloudEventsVersion: '1.0',
        },
        messages: [
          {
            resourceTypeId: 'product',
            types: ['ProductPublished'],
          },
          {
            resourceTypeId: 'order',
            types: ['OrderCreated'],
          },
        ],
      },
    })
  })
  it('should POST with expected body', async () => {
    await createMySubscription(mockApiRoot, 'topicName', 'projectId')

    expect(mockPostfn).toHaveBeenCalledWith({
      body: {
        key: MY_SUBSCRIPTION_KEY,
        destination: {
          projectId: 'projectId',
          topic: 'topicName',
          type: 'GoogleCloudPubSub',
        },
        format: {
          type: 'CloudEvents',
          cloudEventsVersion: '1.0',
        },
        messages: [
          {
            resourceTypeId: 'product',
            types: ['ProductPublished'],
          },
          {
            resourceTypeId: 'order',
            types: ['OrderCreated'],
          },
        ],
      },
    })
  })
})

describe('deleteMySubscription', () => {
  let mockDeletefn: typeof jest.fn
  let mockApiRoot: ByProjectKeyRequestBuilder

  const mockGetResponse = {
    body: {
      results: [{ version: 1 }],
    },
  }

  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
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
    await deleteMySubscription(mockApiRoot)

    expect(mockDeletefn).toHaveBeenCalledWith({
      queryArgs: { version: 1 },
    })
  })
})
