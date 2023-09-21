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

async function run(): Promise<void> {
  try {
    await fluentLogin();

    const { body: { results: ctCategories }} = await createApiRoot()
      .categories()
      .get({ queryArgs: { perPage: 500, page: 1 } })
      .execute();

    const validCTCategories = ctCategories.filter(categories => categories.key);

    const createFluentCategories = validCTCategories
      .map(async(category) => {
        const fluentCategory = getFluentCategory(category);
        fluentCategory && await createCategory(fluentCategory);
      });

    await Promise.all(createFluentCategories);
    
    const perPage = 1;
    let page = 1;
    let allProducts: any = [];

    while (true) {
      const { 
        body: { results, total }
    } = await createApiRoot()
        .products()
        .get({ queryArgs: { perPage, page } })
        .execute();


      results.map(async (product) => {
        const { name, description, categories, masterVariant, variants }  = product.masterData.current
        
        const  fluentCategories = getFluentCategoriesFromCTCategories(categories, validCTCategories);

        if (!product.key) return;
        
        const productKey = product.key;
        const fluentStandardProduct = getFluentStandardProduct({
          productName: name['en-US'],
          productDescription: description?.['en-US'].substring(0, 255), // we need to adjust the length of the description
          productKey: productKey,
          productCategories: fluentCategories
        })

        await createStandardProduct(fluentStandardProduct);
        const createFluentProductVariants = [masterVariant ,...variants]
          .filter(variant => variant.sku)
          .map(variant => 
            getFluentProductVariant({ 
              product: variant, 
              productName: name['en-US'],
              productDescription: description?.['en-US'].substring(0, 33),
              fluentCategories: fluentCategories, 
              fluentStandardProductRef: productKey
            })
          )
          .map((fluentVariant) => createVariantProduct(fluentVariant));

        const x = await Promise.all(createFluentProductVariants);
        console.log('x -----> ',x);
      });
      
      if (!total || page >= total) {
        break;
      }

      // Wait 5 seconds before making the next request
      await new Promise((resolve) => setTimeout(resolve, 3000));    
      page++;
      break
    }
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
