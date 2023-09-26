import axios from 'axios';
import { fluentLogin, fluentGraphQL } from './client'; // Import the functions you want to test

describe('Fluent Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log in and set headers', async () => {
    const mockAccessToken = {
      token_type: 'Bearer',
      access_token: 'mockedAccessToken',
      expires_in: 3600,
    };

    // Mock axios.post to return a mock access token
    (axios.post as jest.Mock).mockResolvedValue({ data: mockAccessToken });

    await fluentLogin();

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/oauth/token'),
      {},
      {
        params: {
          client_id: expect.any(String),
          client_secret: expect.any(String),
          username: expect.any(String),
          password: expect.any(String),
          grant_type: 'password',
          scope: 'api',
        },
      }
    );
    expect(axios.defaults.headers.common['Authorization']).toBe(
      'Bearer mockedAccessToken'
    );
  });

  it('should make a GraphQL request', async () => {
    const mockResponseData = { data: 'mockedData' };

    // Mock axios.post to return a mock response
    (axios.post as jest.Mock).mockResolvedValue({ data: mockResponseData });

    const result = await fluentGraphQL({ query: 'query' });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/graphql'),
      { query: 'query', variables: undefined },
      { headers: expect.any(Object) }
    );
    expect(result).toEqual(mockResponseData);
  });

  it('should handle login error', async () => {
    // Mock axios.post to simulate an error response
    (axios.post as jest.Mock).mockRejectedValue(new Error('Login failed'));

    try {
      await fluentLogin();
    } catch (error) {
      expect(error).toEqual(new Error('Login failed'));
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
      expect(axios.defaults.headers.common['ExpiredAt']).toBeUndefined();
    }
  });


  ///

  it('should handle login error', async () => {
    // Mock axios.post to simulate an error response
    (axios.post as jest.Mock).mockRejectedValue(new Error('Login failed'));

    try {
      await fluentLogin();
    } catch (error) {
      expect(error).toEqual(new Error('Login failed'));
      expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
      expect(axios.defaults.headers.common['ExpiredAt']).toBeUndefined();
    }
  });

  it('should handle GraphQL request error', async () => {
    // Mock axios.post to simulate an error response
    (axios.post as jest.Mock).mockRejectedValue(new Error('GraphQL request failed'));

    try {
      await fluentGraphQL({ query: 'query' });
    } catch (error) {
      expect(error).toEqual(new Error('GraphQL request failed'));
    }
  });

  // Test when environment variables are not set (e.g., process.env.FLUENT_CLIENT_ID is empty)
  it('should handle missing environment variables', async () => {
    const originalEnv = process.env;
    process.env = {}; // Empty environment variables

    try {
      await fluentLogin();
      // Add more tests for other functions as needed

    } catch (error) {
      expect(error).toEqual(new Error('Missing environment variable(s)'));
    } finally {
      process.env = originalEnv; // Restore original environment variables
    }
  });

});
