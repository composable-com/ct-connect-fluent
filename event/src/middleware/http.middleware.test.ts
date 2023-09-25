import { httpMiddlewareOptions } from './http.middleware';

jest.mock('../utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    region: 'test-region',
  }),
}));

describe('httpMiddlewareOptions configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate httpMiddlewareOptions with the correct host', () => {
    const expectedHttpMiddlewareOptions = {
      host: `https://api.test-region.commercetools.com`,
    };

    expect(httpMiddlewareOptions).toEqual(expectedHttpMiddlewareOptions);
  });
});
