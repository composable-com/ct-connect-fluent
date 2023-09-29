import { assertError } from '../utils/assert.utils';
import * as postDeploy from './post-deploy';
import * as actions from './actions';

jest.mock('../utils/assert.utils', () => ({
  assertError: jest.fn(),
  assertString: jest.fn(),
}));

jest.mock('../client/create.client', () => {
  return {
    createApiRoot: jest.fn(),
  };
});

jest.mock('../utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    projectKey: 'test-project-key',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    scope: 'test-scope',
    region: 'test-region',
  }),
}));

jest.mock('./actions', () => ({
  createCartUpdateExtension: jest.fn(),
  createCustomCartDiscountType: jest.fn(),
}));

describe('postDeploy', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should create an extension and a cart discount type', async () => {
    const properties: Map<string, unknown> = new Map();
    properties.set(postDeploy.CONNECT_APPLICATION_URL_KEY, 'mockUrlKey');

    await postDeploy.postDeploy(properties);

    expect(actions.createCartUpdateExtension).toHaveBeenCalled();
    expect(actions.createCustomCartDiscountType).toHaveBeenCalled();
  });
});
describe('run', () => {
  const beforeEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    process.env = { CONNECT_APPLICATION_URL_KEY: 'mockUrlKey' };
  });

  afterAll(() => {
    process.env = { ...beforeEnv };
  });

  it('should run post deploy actions', async () => {
    await postDeploy.run();

    expect(actions.createCartUpdateExtension).toHaveBeenCalled();
    expect(actions.createCustomCartDiscountType).toHaveBeenCalled();
  });
});
