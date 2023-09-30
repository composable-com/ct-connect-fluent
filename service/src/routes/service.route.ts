import { Router } from 'express';
import { logger } from '../utils/logger.utils';
import { getHandleFluentCatalogIngestion } from '../controllers/handleFluentCatalogIngestion.controller';
import { readConfiguration } from '../utils/config.utils';
import { createApiRoot } from '../client/create.client';

const serviceRouter = Router();

serviceRouter.get('/fluent-catalog-ingestion', getHandleFluentCatalogIngestion);

serviceRouter.post('/', async (req, res) => {
  logger.info('Event received from Webhook');
  const { fluentWebHookName, fluentRetailerId } = readConfiguration();

  const { name, retailerId } = req.body;
  if (
    !name || name !== fluentWebHookName || 
    fluentRetailerId !== Number(retailerId)
  ) {
    logger.info('Invalid request', name, fluentWebHookName, retailerId, fluentRetailerId);
    return res.status(400).send({ error: 'Invalid request' });
  }

  const { entityRef, entityType, entitySubtype, entityStatus } = req.body;

  if (!entityRef || !entityType || !entitySubtype || !entityStatus) {
    return res.status(400).send({ 
      error: 'Invalid request' 
    });
  }

  const ctOrderId = entityRef.split('HD_')[1];
  if (!ctOrderId) return res.status(400).send({ error: 'Invalid request' });


  const { body: { version: orderVersion } } = await createApiRoot()
    .orders()
    .withId({ ID: ctOrderId })
    .get()
    .execute();
    
  await createApiRoot()
    .orders()
    .withId({ ID: ctOrderId })
    .post({
      body: {
        version: orderVersion,
        actions: [
          {
            action: 'changeOrderState',
            orderState: 'Complete'
          },
        ],
      },
    })
    .execute();

  res.status(200);
  res.send();
});

export default serviceRouter;
