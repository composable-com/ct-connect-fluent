import Bottleneck from 'bottleneck';
import { fluentCatalogIngestion } from './fluent-catalog-ingestion';
import { createApiRoot } from '../client/create.client';
import { readConfiguration } from '../utils/config.utils';
import { fluentLogin } from '../fluent/client';
import { getFluentProductVariant, getFluentStandardProduct } from '../fluent/utils';
import { createStandardProduct, createVariantProduct } from '../fluent/api';
import { logger } from '../utils/logger.utils';
import { Product } from '@commercetools/platform-sdk';


jest.mock('../client/create.client');
jest.mock('../utils/config.utils', () => {
  return {
    readConfiguration: jest.fn().mockReturnValue({
      fluentCatalogLocale: 'en-US',
    }),
  }
});
jest.mock('../fluent/client');
jest.mock('../fluent/utils');
jest.mock('../fluent/api');
jest.mock('../utils/logger.utils');

describe('fluentCatalogIngestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call fluentLogin', async () => {
    const mockExecute = jest
    .fn()
    .mockResolvedValue({ body: { results: [], total: 0 } });

  (createApiRoot as jest.Mock).mockReturnValue({
    products: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    execute: mockExecute,
  });

    await fluentCatalogIngestion();

    expect(fluentLogin).toHaveBeenCalledTimes(1);
  });

  it('should call readConfiguration', async () => {
    await fluentCatalogIngestion();

    expect(readConfiguration).toHaveBeenCalledTimes(1);
  });

  it('should call createApiRoot', async () => {
    await fluentCatalogIngestion();

    expect(createApiRoot).toHaveBeenCalledTimes(1);
  });

  it('should call getFluentStandardProduct', async () => {
    const ctProductMocked = {
      key: 'mockKey',
      masterData: { 
        current: {
          description: {
            'en-US': 'mockDescription',
          },
          name: {
            'en-US': 'mockName',
          },
          masterVariant: {
            sku: 'mockSku',
          },
          variants: [{
            sku: 'mockSku',
          }],
        }
      },

    };
    const mockFluentStandardProduct = { name: 'mockName' };
    (getFluentStandardProduct as jest.Mock).mockReturnValue(mockFluentStandardProduct);

    const mockExecute = jest
    .fn()
    .mockResolvedValue({ body: { results: [ctProductMocked], total: 1 } });

  (createApiRoot as jest.Mock).mockReturnValue({
    products: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    execute: mockExecute,
  });


    await fluentCatalogIngestion();

    expect(getFluentStandardProduct).toHaveBeenCalledWith({
      productName: ctProductMocked.masterData.current.name['en-US'],
      productDescription: ctProductMocked.masterData.current.description['en-US'],
      productKey: ctProductMocked.key,
      productCategories: [],
    });
  });

  it('should call createStandardProduct', async () => {
    const mockFluentStandardProduct = { name: 'mockName' };
    (getFluentStandardProduct as jest.Mock).mockReturnValue(mockFluentStandardProduct);

    await fluentCatalogIngestion();

    expect(createStandardProduct).toHaveBeenCalledWith(mockFluentStandardProduct);
  });

  it('should call getFluentProductVariant', async () => {
    const mockProduct = {
      "retailerId": "5000102",
      "name": "UPSERT_PRODUCT",
      "entityRef": "PC:MASTER:5000102",
      "entityType": "PRODUCT_CATALOGUE",
      "entitySubtype": "MASTER",
      "rootEntityRef": "PC:MASTER:5000102",
      "rootEntityType": "PRODUCT_CATALOGUE",
      "attributes": {
          "ref": "twine",
          "type": "STANDARD",
          "status": "ACTIVE",
          "gtin": "NOTFORSALE",
          "name": "testwine",
          "summary": "test product",
          "categoryRefs": []
      }
  };
    const mockFluentProductVariant = {
      "retailerId": "retailer_id",
      "name": "UPSERT_PRODUCT",
      "entityRef": "PC:MASTER:5000102",
      "entityType": "PRODUCT_CATALOGUE",
      "entitySubtype": "MASTER",
      "rootEntityRef":"PC:MASTER:5000102",
      "rootEntityType":"PRODUCT_CATALOGUE",
      "attributes": {
          "ref": "CTCC_AH3051-1-1",
          "type": "VARIANT",
          "status": "ACTIVE",
          "gtin": "D45",
          "name": "Gorgeous Geisha Loose Leaf new x",
          "summary": "Gorgeous Geisha Loose Leaf new",
          "standardProductRef": "twine",
          "attributes": [
                          {
                  "name": "imageUrl",
                  "type": "STRING",
                  "value": "https://cdn.intelligencebank.com/au/share/NOrD/6YEXB/bEeKq/preset=nB3Bb/T115AE009_Gorgeous_Geisha_Digitized_Packaging_medium"
              },
              {
                  "name": "test",
                  "type": "STRING",
                  "value": "test"
              }
          ],
          "categoryRefs": [
              "MENS_SHIRTS"
          ],
          "prices": [
              {
                  "type": "TYPE",
                  "currency": "CAD",
                  "value": 102
              }
          ]
  
      }
  };
    (getFluentProductVariant as jest.Mock).mockReturnValue(mockFluentProductVariant);

    await fluentCatalogIngestion();

    expect(getFluentProductVariant).toHaveBeenCalled();
  });

  it('should call createVariantProduct', async () => {
    const mockFluentProductVariant = { name: 'mockName' };
    (getFluentProductVariant as jest.Mock).mockReturnValue(mockFluentProductVariant);

    await fluentCatalogIngestion();

    expect(createVariantProduct).toHaveBeenCalledWith(mockFluentProductVariant);
  });
});