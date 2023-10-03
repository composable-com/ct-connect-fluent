import { Request, Response } from 'express';
import { createApiRoot } from '../client/create.client';
import { logger } from '../utils/logger.utils';
import { CreatedBy, MessageDeliveryPayload, Order, ProductProjection } from '@commercetools/platform-sdk';
import { getFluentCustomer, getFluentOrder, getFluentProductVariant, getFluentStandardProduct, getFluentTransaction, getProductFluentCategories } from '../fluent/utils';
import { createFinancialTransaction, createOrder, createOrderAndCustomer, createStandardProduct, createVariantProduct, getCustomerByRef } from '../fluent/api';
import { fluentLogin } from '../fluent/client';
import CustomError from '../errors/custom.error';

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

export interface CtEventPayload extends MessageDeliveryPayload {
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

const FLUENT_CATALOG_LOCALE = process.env.FLUENT_CATALOG_LOCALE ?? 'en-US';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  try {
    const payload: CtEventPayload = JSON.parse(
      Buffer.from(request.body.message.data, 'base64').toString()
    );
    logger.info('Event received');
    await fluentLogin();

    const { type } = payload;

    if (type === 'ProductPublished') {
      const { productProjection } = payload;
      // We only want to process products with a key
      if (!productProjection || !productProjection?.key) {
        logger.error(`Product not processed:  Product does not have a key: ${productProjection?.id}`);
        return;
      }

      logger.info(`Processing ProductPublished: ${productProjection.key}`);

      const { name, description, key, variants, masterVariant } = productProjection;

      const fluentStandardProduct = getFluentStandardProduct({
        productKey: key,
        productName: name[FLUENT_CATALOG_LOCALE],
        productDescription: description?.[FLUENT_CATALOG_LOCALE],
        productCategories: []
      });

      if (fluentStandardProduct) {      
        await createStandardProduct(fluentStandardProduct);
        const createFluentProductVariants = [masterVariant ,...variants]
          .filter(variant => variant.sku)
          .map(variant => 
            getFluentProductVariant({ 
              product: variant, 
              productName: name[FLUENT_CATALOG_LOCALE],
              productDescription: description?.[FLUENT_CATALOG_LOCALE],
              fluentCategories: [], 
              fluentStandardProductRef: key
            })
          )
          .map((fluentVariant) => createVariantProduct(fluentVariant));

        await Promise.all(createFluentProductVariants);
        
        logger.info(`Product processed successfully: ${productProjection.key}`);
        response.status(201).send();
        return; 
      }
    }

    if (type === 'OrderCreated') {
      const { order } = payload;
      if (!order || !order?.customerEmail || !order?.customerId) {
        logger.info(`Order not processed:  Order does not have customerEmail or customerId: ${order?.id}`);
        return;
      }

      logger.info(`Processing OrderCreated: ${order.id}`);

      let orderId = '';
      const { data: { customer }} = await getCustomerByRef(order.customerEmail);
      if (customer) {
        const fluentOrder = getFluentOrder(order, Number(customer.id));
        const { data: { createOrder: { id: fluentOrderId } } } = await createOrder({ 
          input: fluentOrder 
        });
        logger.info(`Order created in fluent: ${fluentOrderId}`);
        orderId = fluentOrderId;
      } else {
        logger.info(`Customer not found in fluent: ${order.customerEmail}`);
        const { body: ctCustomer }= await createApiRoot()
          .customers()
          .withId({ ID: order.customerId })
          .get()
          .execute()

        const fluentCustomer = getFluentCustomer(ctCustomer);
        const fluentOrder = getFluentOrder(order);

        const { data: { createOrderAndCustomer: { id: fluentOrderId } }} = await createOrderAndCustomer({ 
          input: {
            ...fluentOrder,
            customer: {
              ...fluentCustomer,
            }
          } 
        });
        orderId = fluentOrderId;
      }

      if (order.paymentInfo?.payments?.length) {
        const { body: ctPaymentDetails } = await createApiRoot()
          .payments()
          .withId({ ID: order?.paymentInfo?.payments[0].id })
          .get()
          .execute();

        const fluentTransaction = getFluentTransaction(ctPaymentDetails, Number(orderId));

        await createFinancialTransaction({ input: fluentTransaction });
      }
      
      response.status(201).send();
      return;
    }

    return response.status(204).send();
  } catch (error) {
    logger.info(`Event message error: ${(error as Error).message}`);
    response.status(400);
    response.send();
  }
};
