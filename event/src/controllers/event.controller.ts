import { Request, Response } from 'express';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { Category, CreatedBy, MessageDeliveryPayload, Order, ProductProjection } from '@commercetools/platform-sdk';
import { getFluentCategoriesFromCTCategories, getFluentOrder, getFluentProductVariant, getFluentStandardProduct, getProductFluentCategories } from '../fluent/utils';
import { createOrder, createStandardProduct, createVariantProduct } from '../fluent/api';

export interface CtEvent {
  message: {
    attributes: {
      'content-type': string;
    };
    data: string;
    messageId: string;
    message_id: string;
    publishTime: string;
    publish_time: string;
  };
  subscription: string;
}

export interface CtProductPublishdPayload extends MessageDeliveryPayload {
  notificationType: 'Message';
  projectKey: string;
  id: string;
  version: number;
  sequenceNumber: number;
  resource: {
    typeId: 'product';
    id: string;
  };
  resourceVersion: number;
  type: 'ProductPublished' | 'OrderCreated';
  order?: Order;
  productProjection?: ProductProjection;
  createdAt: string;
  lastModifiedAt: string;
  createdBy: CreatedBy;
  lastModifiedBy: CreatedBy;
}

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  logger.info('Event received');

  try {
    const event: CtEvent = request.body.data;
    const payload: CtProductPublishdPayload = JSON.parse(
      Buffer.from(event.message.data, 'base64').toString()
    ).data; // .data or not ?? 

    const { type, productProjection } = payload;
    console.log(type, JSON.stringify(payload, null, 2))

    if (type === 'ProductPublished' && productProjection?.key) {
      logger.info(`Processing ProductPublished: ${productProjection.key}`);

      // We get the catalog to get the category name (needed for the fluent category)
      // if the product has a new category it won't be added in the fluent product
      // Q:    should we also listen for category changes/creations?
      //       how important is to have the categories synced ?
      const { body: { results: ctCategories }} = await createApiRoot()
        .categories()
        .get({ queryArgs: { perPage: 500, page: 1 } })
        .execute();
      
      const validCTCategories = ctCategories.filter(categories => categories.key);

      const { name, description, key, categories, variants, masterVariant } = productProjection;
      const  fluentCategories = getFluentCategoriesFromCTCategories(categories, validCTCategories);

      const fluentStandardProduct = getFluentStandardProduct({
        productKey: key,
        productName: name['en-US'],
        productDescription: description?.['en-US'],
        productCategories: fluentCategories
      });

      await createStandardProduct(fluentStandardProduct);

      const createFluentProductVariants = [masterVariant ,...variants]
      .filter(variant => variant.sku)
      .map(variant => 
        getFluentProductVariant({ 
          product: variant, 
          productName: name['en-US'],
          productDescription: description?.['en-US'].substring(0, 33),
          fluentCategories: fluentCategories, 
          fluentStandardProductRef: key
        })
      )
      .map((fluentVariant) => createVariantProduct(fluentVariant));

      await Promise.all(createFluentProductVariants);
    }

    const { order } = payload;
    if (type === 'OrderCreated' && order?.customerEmail) {
      logger.info(`Processing OrderCreated: ${order.id}`);

      const fluentOrder = getFluentOrder(order);
      if (fluentOrder) await createOrder(fluentOrder);
    }

  } catch (error) {
    logger.info(`Event message error: ${(error as Error).message}`);
    response.status(400);
    response.send();
  }
  response.status(204).send();
};
