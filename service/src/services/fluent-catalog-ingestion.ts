import Bottleneck from 'bottleneck';
import { logger } from '../utils/logger.utils';
import { createApiRoot } from '../client/create.client';
import { readConfiguration } from '../utils/config.utils';
import { fluentLogin } from '../fluent/client';
import { getFluentProductVariant, getFluentStandardProduct } from '../fluent/utils';
import { createStandardProduct, createVariantProduct } from '../fluent/api';

export async function fluentCatalogIngestion() {
  logger.info('Service called! > fluentCatalogIngestion');

  await fluentLogin();

  const {
    fluentCatalogLocale: FLUENT_CATALOG_LOCALE,
  } = readConfiguration();

  let page = 0;
  const limit = 2;

  const apiRoot = createApiRoot();
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 300,
  });

  const getProducts = limiter.wrap(
    async (params: { limit: number; offset: number, page: number }) => {
      return await apiRoot
        .products()
        .get({ queryArgs: {          
          limit, 
          page,
          offset: page * limit, 
        }})
        .execute();
    }
  );
  
  const fluentLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 300,
  });


  while (true) {
    const { body: { results, total }} = await getProducts({ limit, offset: page * limit, page });
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
        await fluentLimiter.schedule(() => createStandardProduct(fluentStandardProduct));

        const allProductVariants = [masterVariant ,...variants]
        if (allProductVariants.filter(variant => variant.sku && variant.sku === productKey).length > 0) {
          logger.info(`Some variants of this product have an SKU equal to the Standard Product Key ${productKey}`);
        }

        if (allProductVariants.length === 0) return;
        
        const validVariants = allProductVariants.filter(variant => variant.sku && variant.sku !== productKey)
        for await (const productVariant of validVariants) {
          await limiter.schedule(async() => {
            const fluentVariant = getFluentProductVariant({ 
              product: productVariant, 
              productName: name[FLUENT_CATALOG_LOCALE],
              productDescription: description?.[FLUENT_CATALOG_LOCALE],
              fluentCategories: [], 
              fluentStandardProductRef: productKey
            });
            await createVariantProduct(fluentVariant);
          })
        }
      }
    });
    await Promise.all(productsPromise);

    if (!total || page * limit >= total) {
      logger.info('All products processed! Sync finished!');
      break;
    }

    page++;
  }
}