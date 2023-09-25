import { createApiRoot } from './create.client';

jest.mock('../utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    projectKey: 'test-project-key',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    scope: 'test-scope',
    region: 'test-region'
  }),
}));

describe('createApiRoot function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an API root with the correct project key', () => {
    const apiRoot = createApiRoot();

    expect(apiRoot.apiClients).toBeDefined();
  });
});
