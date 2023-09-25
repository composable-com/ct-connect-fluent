import { logger } from './logger.utils';

describe('logger.utils', () => {
  it('should instantiate the logger', () => {
    // Expect the logger.info method to have been called
    expect(typeof logger).toEqual('object');
  });
});
