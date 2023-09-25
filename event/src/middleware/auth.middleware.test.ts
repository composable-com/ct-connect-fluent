import { authMiddlewareOptions } from './auth.middleware';

const mockConfiguration = {
  region: 'test-region',
  projectKey: 'test-project',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  scope: undefined,
};

jest.mock('../utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    region: 'test-region',
    projectKey: 'test-project',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    scope: undefined,
  }),
}));

describe('authMiddlewareOptions configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use default scope when scope is not provided in configuration', () => {
    const expectedAuthMiddlewareOptions = {
      host: `https://auth.${mockConfiguration.region}.commercetools.com`,
      projectKey: mockConfiguration.projectKey,
      credentials: {
        clientId: mockConfiguration.clientId,
        clientSecret: mockConfiguration.clientSecret,
      },
      scopes: ['default'],
    };

    expect(authMiddlewareOptions).toEqual(expectedAuthMiddlewareOptions);
  });
});
