import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import {
  CART_UPDATE_EXTENSION_KEY,
  createCartUpdateExtension,
  deleteCartUpdateExtension,
} from './actions';

describe('createCartUpdateExtension', () => {
  let mockDeletefn: typeof jest.fn;
  let mockPostfn: typeof jest.fn;
  let mockApiRoot: ByProjectKeyRequestBuilder;

  const mockGetResponse = {
    body: {
      results: [{ version: 1 }],
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    mockDeletefn = jest.fn().mockReturnThis();
    mockPostfn = jest.fn().mockReturnThis();
    mockApiRoot = {
      extensions: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      withKey: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(mockGetResponse),
      delete: mockDeletefn,
      post: mockPostfn,
    } as unknown as ByProjectKeyRequestBuilder;
  });

  it('should delete an existing subscription if one exists', async () => {
    const mockAppURL = 'mockApplicationUrl';
    await createCartUpdateExtension(mockApiRoot, mockAppURL);

    expect(mockDeletefn).toHaveBeenCalledWith({
      queryArgs: { version: 1 },
    });
  });
  it('should POST with expected body', async () => {
    const mockAppURL = 'mockApplicationUrl';
    await createCartUpdateExtension(mockApiRoot, mockAppURL);

    expect(mockPostfn).toHaveBeenCalledWith({
      body: {
        key: CART_UPDATE_EXTENSION_KEY,
        destination: {
          type: 'HTTP',
          url: mockAppURL,
        },
        triggers: [
          {
            resourceTypeId: 'cart',
            actions: ['Update'],
          },
        ],
      },
    });
  });
});

describe('deleteCartUpdateExtension', () => {
  let mockDeletefn: typeof jest.fn;
  let mockApiRoot: ByProjectKeyRequestBuilder;

  const mockGetResponse = {
    body: {
      results: [{ version: 1 }],
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockDeletefn = jest.fn().mockReturnThis();
    mockApiRoot = {
      extensions: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      withKey: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(mockGetResponse),
      delete: mockDeletefn,
    } as unknown as ByProjectKeyRequestBuilder;
  });

  it('should delete a subscription', async () => {
    await deleteCartUpdateExtension(mockApiRoot);

    expect(mockDeletefn).toHaveBeenCalledWith({
      queryArgs: { version: 1 },
    });
  });
});
