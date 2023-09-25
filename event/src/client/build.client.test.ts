import { createClient } from './build.client';
import { ClientBuilder } from '@commercetools/sdk-client-v2';

jest.mock('@commercetools/sdk-client-v2', () => ({
  ClientBuilder: jest.fn().mockImplementation(() => ({
    withProjectKey: jest.fn().mockReturnThis(),
    withClientCredentialsFlow: jest.fn().mockReturnThis(),
    withHttpMiddleware: jest.fn().mockReturnThis(),
    build: jest.fn(),
  })),
}));

jest.mock('../middleware/auth.middleware', () => ({
  authMiddlewareOptions: jest.fn(),
}));

jest.mock('../middleware/http.middleware', () => ({
  httpMiddlewareOptions: jest.fn(),
}));

jest.mock('../utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    projectKey: 'test-project-key',
  }),
}));

describe('createClient function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new Client with the correct configuration', () => {
    createClient();
    expect(ClientBuilder).toHaveBeenCalled();
  });
});
