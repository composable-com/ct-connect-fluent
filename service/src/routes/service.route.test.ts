import request from 'supertest';
import { createApiRoot } from '../client/create.client';
import { app } from '../index';

jest.mock('../client/create.client');

jest.mock('../utils/config.utils', () => {
  return {
    readConfiguration: jest.fn().mockReturnValue({
      fluentCatalogLocale: 'en-US',
      fluentRetailerId: 1232642,
      fluentWebHookName: 'webhook-test.webhook.order-completed.commercetools',
    }),
  }
});

const routePath = '/service';
describe('serviceRouter', () => {


  describe('GET /fluent-catalog-ingestion', () => {
    it('should return 401 if does not have the proper auth header', async () => {
      const response = await request(app).get(`${routePath}/fluent-catalog-ingestion`);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /', () => {
    let server: any = null;

    beforeAll(() => {
      // Listen the application
      server = app.listen();
    });
  
    afterAll(async () => {
      await server.close();
    });

    const mockCreateApiRoot = createApiRoot as jest.MockedFunction<typeof createApiRoot>;

    beforeEach(() => {
      jest.clearAllMocks();
      const mockExecute = jest
        .fn()
        .mockResolvedValue({
          body: {
            version: 1
          }
        });

      (createApiRoot as jest.Mock).mockReturnValue({
        products: jest.fn().mockReturnThis(),
        orders: jest.fn().mockReturnThis(),
        withId: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis(),
        post: jest.fn().mockReturnThis(),
        execute: mockExecute,
      });
    });

    it('should return 400 Bad Request if name is missing', async () => {
      const response = await request(app).post(`${routePath}`).send({
        retailerId: '123',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 Bad Request if name is incorrect', async () => {
      const response = await request(app).post(routePath).send({
        name: 'wrong',
        retailerId: '123',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 Bad Request if retailerId is incorrect', async () => {
      const response = await request(app).post(routePath).send({
        name: 'test',
        retailerId: '456',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 Bad Request if entityRef is missing', async () => {
      const response = await request(app).post(routePath).send({
        name: 'webhook-test.webhook.order-completed.commercetools',
        retailerId: '1232642',
        entityType: 'test',
        entitySubtype: 'test',
        entityStatus: 'test',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 Bad Request if entityType is missing', async () => {
      const response = await request(app).post(routePath).send({
        name: 'webhook-test.webhook.order-completed.commercetools',
        retailerId: '123',
        entityRef: 'test',
        entitySubtype: 'test',
        entityStatus: 'test',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 Bad Request if entitySubtype is missing', async () => {
      const response = await request(app).post(routePath).send({
        name: 'webhook-test.webhook.order-completed.commercetools',
        retailerId: '123',
        entityRef: 'test',
        entityType: 'test',
        entityStatus: 'test',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 Bad Request if entityStatus is missing', async () => {
      const response = await request(app).post(routePath).send({
        name: 'webhook-test.webhook.order-completed.commercetools',
        retailerId: '123',
        entityRef: 'test',
        entityType: 'test',
        entitySubtype: 'test',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 400 Bad Request if ctOrderId is missing', async () => {
      const response = await request(app).post(routePath).send({
        name: 'webhook-test.webhook.order-completed.commercetools',
        retailerId: '1232642',
        entityRef: '64264262426atohenatohe',
        entityType: 'test',
        entitySubtype: 'test',
        entityStatus: 'test',
      });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid request' });
    });

    it('should return 200 OK if request is valid', async () => {
      const response = await request(app).post(routePath).send({
        "name": "webhook-test.webhook.order-completed.commercetools",
        "retailerId": "1232642",
        "entityRef": "HD_5e17926c-4207-4620-90a2-424204doe2",
        "entityStatus": "COMPLETE",
        "entitySubtype": "HD",
        "entityType": "ORDER"
      });
      expect(response.status).toBe(200);
      expect(mockCreateApiRoot).toHaveBeenCalledTimes(2);
    });
  });
});