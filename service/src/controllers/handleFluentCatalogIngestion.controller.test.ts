import { Request, Response } from 'express';
import {
  controllerHandler,
  getHandleFluentCatalogIngestion,
} from './handleFluentCatalogIngestion.controller';
import * as BasicAuthUtils from '../utils/basic-auth.utils';
import * as FluentService from '../services/fluent-catalog-ingestion';


jest.mock('../services/fluent-catalog-ingestion');

jest.mock('../utils/config.utils', () => {
  return {
    readConfiguration: jest.fn().mockReturnValue({
      clientId: 'mockClientId',
      clientSecret: 'mockClientSecret',
      projectKey: 'mockProjectKey',
      scope: 'manage_project:mockProjectKey view_products:mockProjectKey',
      region: 'mockRegion',
      fluentClientId: 'fluentClientId',
      fluentClientSecret: 'fluentClientSecret',
      fluentUsername: 'fluentUsername',
      fluentPassword: 'fluentPassword',
      fluentCatalogLocale: 'en-US',
      fluentRetailerId: 5204204,
      fluentWebHookName: 'fluentWebHookName',
      basicAuthSecret: 'mockSecret',
    }),
  };
});

describe('getHandleFluentCatalogIngestion', () => {
  let req: Request;
  let res: Response;
  let basicAuthHandlerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create mock Request and Response objects
    req = {} as Request;
    // @ts-ignore
    res = { contentType: jest.fn(), status: jest.fn(), send: jest.fn() } as Response;

    // Mock the basicAuthHandler function
    basicAuthHandlerSpy = jest
      .spyOn(BasicAuthUtils, 'basicAuthHandler')
      .mockImplementation(async (options) => {
        // Simulate the handler function within basicAuthHandler
        await options.handler();
      });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore all mocked functions after each test
  });

  it('should call basicAuthHandler and execute the controllerHandler', async () => {
    jest
      .spyOn(FluentService, 'fluentCatalogIngestion')
      .mockResolvedValue();

    // Call the function
    await getHandleFluentCatalogIngestion(req, res);

    // Verify that basicAuthHandler is called with the correct arguments
    expect(basicAuthHandlerSpy).toHaveBeenCalledWith({
      req,
      res,
      handler: expect.any(Function), // A function should be passed as the handler
    });
  });

  it('should call fluentCatalogIngestion and set response properties in controllerHandler', async () => {
    // Mock the bloomreachDiscoveryCatalogIngestion function
    const fluentCatalogIngestionSpy = jest
      .spyOn(FluentService, 'fluentCatalogIngestion')
      .mockResolvedValue();

    // Call the controllerHandler function
    await controllerHandler(res);

    // Verify that bloomreachDiscoveryCatalogIngestion is called
    expect(fluentCatalogIngestionSpy).toHaveBeenCalled();

    // Verify that the response methods are called correctly
    expect(res.contentType).toHaveBeenCalledWith('application/javascript');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true });
  });
});