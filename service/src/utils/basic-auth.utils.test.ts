import { Request, Response } from 'express';
import { basicAuthHandler } from './basic-auth.utils';

// Mock the readConfiguration function
jest.mock('./config.utils', () => ({
  readConfiguration: jest.fn(() => ({
    basicAuthSecret: 'mockSecret',
    projectKey: 'mockProjectKey',
  })),
}));

describe('basicAuthHandler', () => {
  it('should call the handler when valid credentials are provided', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Basic bW9ja1Byb2plY3RLZXk6bW9ja1NlY3JldA==', // Base64 encoded credentials
      },
    } as Request;
    const mockResponse = {
      contentType: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Response;
    const mockHandler = jest.fn();

    await basicAuthHandler({
      req: mockRequest,
      res: mockResponse,
      handler: mockHandler,
    });

    expect(mockHandler).toHaveBeenCalled();
  });

  it('should return Unauthorized when invalid credentials are provided', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Basic invalidCredentials', // Invalid credentials
      },
    } as Request;
    const sendMock = jest.fn();
    const mockResponse = {
      contentType: jest.fn(),
      status: jest.fn().mockReturnValue({
        send: sendMock,
      }),
      send: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Response;
    const mockHandler = jest.fn();

    await basicAuthHandler({
      req: mockRequest,
      res: mockResponse,
      handler: mockHandler,
    });

    expect(mockHandler).not.toHaveBeenCalled();
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Basic realm="Restricted Area"'
    );
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith('Unauthorized');
  });

  it('should handle errors from the handler', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Basic bW9ja1Byb2plY3RLZXk6bW9ja1NlY3JldA==', // Base64 encoded credentials
      },
    } as Request;
    const mockResponse = {
      contentType: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as Response;
    const mockHandler = jest.fn(() => {
      throw new Error('Test error');
    });

    await basicAuthHandler({
      req: mockRequest,
      res: mockResponse,
      handler: mockHandler,
    });

    expect(mockHandler).toHaveBeenCalled();
    expect(mockResponse.contentType).toHaveBeenCalledWith('text/html');
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalled();
  });
});