import dotenv from 'dotenv';
dotenv.config();

// import { createApiRoot } from '../client/create.client';
import { assertError } from '../utils/assert.utils';
// import { deleteCustomerCreateSubscription } from './actions';
import { fluentLogin } from '../fluent/client';
import { createApiRoot } from '../client/create.client';
import { Category, Product, ProductChangeMasterVariantAction } from '@commercetools/platform-sdk';
import { FluentStandardProduct, FluentVariantProduct } from '../fluent/types';
import { getFluentCategoriesFromCTCategories, getFluentCategory, getFluentProductVariant, getFluentStandardProduct } from '../fluent/utils';
import { createCategory, createStandardProduct, createVariantProduct } from '../fluent/api';
import { create } from 'axios';

// async function preUndeploy(): Promise<void> {
//   const apiRoot = createApiRoot();
//   await deleteCustomerCreateSubscription(apiRoot);
// }

const FLUENT_CATALOG_LOCALE = process.env.FLUENT_CATALOG_LOCALE ?? 'en-US';

async function run(): Promise<void> {
  try {
    await fluentLogin();
    
    const perPage = 50;
    let page = 1;


    while (true) {
      const { 
        body: { results, total }
    } = await createApiRoot()
        .products()
        .get({ queryArgs: { 
          perPage, 
          page,
          offset: (page - 1) * perPage,
        } })
        .execute();

      const productsPromise = results.map(async (product) => {
        const { name, description, masterVariant, variants }  = product.masterData.current      
        if (!product.key) return;
        
        const productKey = product.key;
        const fluentStandardProduct = getFluentStandardProduct({
          productName: name[FLUENT_CATALOG_LOCALE],
          productDescription: description?.[FLUENT_CATALOG_LOCALE]?.substring(0, 255) ?? '',
          productKey: productKey,
          productCategories: []
        })

        await createStandardProduct(fluentStandardProduct);
        const createFluentProductVariants = [masterVariant ,...variants]
          .filter(variant => variant.sku)
          .map(variant => 
            getFluentProductVariant({ 
              product: variant, 
              productName: name[FLUENT_CATALOG_LOCALE],
              productDescription: description?.[FLUENT_CATALOG_LOCALE]?.substring(0, 255) ?? '',
              fluentCategories: [], 
              fluentStandardProductRef: productKey
            })
          )
          .map(async (fluentVariant) => await createVariantProduct(fluentVariant));
        await Promise.all(createFluentProductVariants);
      });
      await Promise.all(productsPromise);

      if (!total || page >= total) {
        break;
      }

      // Wait 5 seconds before making the next request
      await new Promise((resolve) => setTimeout(resolve, 1000));    
      page++;
    }
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
