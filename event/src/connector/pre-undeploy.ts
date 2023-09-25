import dotenv from 'dotenv';
dotenv.config();

import { assertError } from '../utils/assert.utils';
import { deleteMySubscription } from './actions';
import { fluentLogin } from '../fluent/client';
import { createApiRoot } from '../client/create.client';
import { getFluentProductVariant, getFluentStandardProduct } from '../fluent/utils';
import { createStandardProduct, createVariantProduct } from '../fluent/api';
import { logger } from '../utils/logger.utils';

async function preUndeploy(): Promise<void> {
  const apiRoot = createApiRoot();
  await deleteMySubscription(apiRoot);
}

const FLUENT_CATALOG_LOCALE = process.env.FLUENT_CATALOG_LOCALE ?? 'en-US';

async function run(): Promise<void> {
  await preUndeploy();

  try {
    await fluentLogin();
    
    const perPage = 2;
    let page = 0;

    while (true) {
      const { 
        body: { results, total }
      } = await createApiRoot()
        .products()
        .get({ queryArgs: { 
          limit: perPage, 
          page,
          offset: page * perPage,
        } })
        .execute();

      const productsPromise = results.map(async (product) => {
        const { name, description, masterVariant, variants }  = product.masterData.current      
        if (!product.key) return;
        if (!name[FLUENT_CATALOG_LOCALE]) {
          logger.info(`Product ${product.key} without name ${FLUENT_CATALOG_LOCALE} can't be processed`);
          return;
        }

        const productKey = product.key;
        const fluentStandardProduct = getFluentStandardProduct({
          productName: name[FLUENT_CATALOG_LOCALE],
          productDescription: description?.[FLUENT_CATALOG_LOCALE],
          productKey: productKey,
          productCategories: []
        })

        if (fluentStandardProduct) {
          await createStandardProduct(fluentStandardProduct);
          const createFluentProductVariants = [masterVariant ,...variants]
            .filter(variant => variant.sku && variant.sku !== productKey)
            .map(variant => 
              getFluentProductVariant({ 
                product: variant, 
                productName: name[FLUENT_CATALOG_LOCALE],
                productDescription: description?.[FLUENT_CATALOG_LOCALE],
                fluentCategories: [], 
                fluentStandardProductRef: productKey
              })
            )
            .map(async (fluentVariant) => { 
              return await createVariantProduct(fluentVariant)
            });
          await Promise.all(createFluentProductVariants);
        }
      });
      await Promise.all(productsPromise);

      if (!total || page * perPage >= total) {
        break;
      }

      // Wait 2.5 seconds before making the next request
      await new Promise((resolve) => setTimeout(resolve, 2500));    
      page++;
    }
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
