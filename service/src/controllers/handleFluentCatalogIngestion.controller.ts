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
     await controllerHandler(res);
    },
  });
}

export async function controllerHandler(res: Response) {
  fluentCatalogIngestion();
  res.send({ success: true });
}