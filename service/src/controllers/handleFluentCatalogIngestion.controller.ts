import { Request, Response } from 'express';
import { basicAuthHandler } from '../utils/basic-auth.utils';
import { fluentCatalogIngestion } from '../services/fluent-catalog-ingestion';

export async function getHandleFluentCatalogIngestion(
  req: Request,
  res: Response
) {
  basicAuthHandler({
    req,
    res,
    handler: async () => {
      fluentCatalogIngestion();
      
      res.contentType('application/javascript');
      res.status(200);
      res.send({
        success: true,
      });
    },
  });
}