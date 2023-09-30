import { deleteCartUpdateExtension } from './actions';
import { preUndeploy, run } from './pre-undeploy';

jest.mock('../utils/assert.utils');
jest.mock('./actions');
jest.mock('../client/create.client', () => {
  return {
    createApiRoot: jest.fn(),
  };
});

jest.mock('../utils/logger.utils', () => {
  return {
    logger: {
      info: jest.fn().mockReturnValue(''),
      error: jest.fn().mockReturnValue(''),
    },
  };
});

describe('preUndeploy', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('should delete subscription', async () => {
    await preUndeploy();

    expect(deleteCartUpdateExtension).toHaveBeenCalled();
  });
});

describe('run', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it('should delete subscription', async () => {
    await run();

    expect(deleteCartUpdateExtension).toHaveBeenCalled();
  });
});
