import {
  getFluentStandardProduct,
  getProductFluentCategories,
  getFluentProductVariant,
  getFluentCategory,
  getFluentCategoriesFromCTCategories,
  formatCommercetoolsMoney,
  getFluentCustomer,
  getFluentOrder,
  getFluentTransaction,
} from './utils';

describe('getFluentStandardProduct', () => {
  it('should return a FluentStandardProduct', () => {
    const params = {
      productName: 'Test Product',
      productCategories: ['Category1', 'Category2'],
      productDescription: 'Test Description',
      productKey: '123456',
    };

    const result = getFluentStandardProduct(params);

    expect(result).toEqual({
      retailerId: expect.any(String),
      name: 'UPSERT_PRODUCT',
      entityRef: expect.any(String),
      entityType: 'PRODUCT_CATALOGUE',
      entitySubtype: 'MASTER',
      rootEntityRef: expect.any(String),
      rootEntityType: 'PRODUCT_CATALOGUE',
      attributes: {
        ref: '123456',
        type: 'STANDARD',
        status: 'ACTIVE',
        gtin: 'NOTFORSALE',
        name: 'Test Product',
        summary: 'Test Description',
        categoryRefs: ['Category1', 'Category2'],
      },
    });
  });
});

describe('getProductFluentCategories', () => {
  it('should return an array of category keys', () => {
    const fluentCategories = [{ key: 'Category1' }, { key: 'Category2' }];
    // @ts-ignore
    const result = getProductFluentCategories(fluentCategories);
    expect(result).toEqual(['Category1', 'Category2']);
  });
});

describe('getFluentProductVariant', () => {
  it('should return a FluentVariantProduct', () => {
    const params = {
      product: {
        sku: 'SKU123',
        images: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }],
        prices: [{ value: { currencyCode: 'USD', centAmount: 1000 } }],
        attributes: [{ name: 'Attribute1', value: 'Value1' }],
      },
      fluentCategories: ['Category1', 'Category2'],
      fluentStandardProductRef: '123456',
      productName: 'Test Product',
      productDescription: 'Test Description',
    };

    // @ts-ignore
    const result = getFluentProductVariant(params);

    expect(result).toEqual({
      retailerId: expect.any(String),
      name: 'UPSERT_PRODUCT',
      entityRef: expect.any(String),
      entityType: 'PRODUCT_CATALOGUE',
      entitySubtype: 'MASTER',
      rootEntityRef: expect.any(String),
      rootEntityType: 'PRODUCT_CATALOGUE',
      attributes: {
        ref: 'SKU123',
        type: 'VARIANT',
        status: 'ACTIVE',
        gtin: 'D45',
        name: 'Test Product',
        summary: 'Test Description',
        standardProductRef: '123456',
        attributes: [
          { name: 'imageUrl', type: 'STRING', value: 'image1.jpg' },
          { name: 'imageUrl', type: 'STRING', value: 'image2.jpg' },
          { name: 'Attribute1', type: 'STRING', value: 'Value1' },
        ],
        categoryRefs: ['Category1', 'Category2'],
        prices: [{ type: 'TYPE', currency: 'USD', value: 10 }],
      },
    });
  });
});

describe('getFluentCategory', () => {
  it('should return a FluentCategory', () => {
    const category = {
      key: 'Category123',
      name: { 'en-US': 'Category Name' },
      description: { 'en-US': 'Category Description' },
    };

    // @ts-ignore
    const result = getFluentCategory(category);

    expect(result).toEqual({
      retailerId: expect.any(String),
      name: 'UPSERT_CATEGORY',
      entityRef: expect.any(String),
      entityType: 'PRODUCT_CATALOGUE',
      entitySubtype: 'MASTER',
      attributes: {
        ref: 'Category123',
        type: 'DEFAULT',
        status: 'ACTIVE',
        name: 'Category Name',
        summary: 'Category Description',
      },
    });
  });
});

describe('getFluentCategoriesFromCTCategories', () => {
  it('should return an array of fluent category keys', () => {
    const productCategories = [{ id: 'Category1' }, { id: 'Category2' }];
    const allCategories = [
      { id: 'Category1', key: 'Cat1' },
      { id: 'Category2', key: 'Cat2' },
    ];

    // @ts-ignore
    const result = getFluentCategoriesFromCTCategories(productCategories, allCategories);
    expect(result).toEqual(['Cat1', 'Cat2']);
  });
});

describe('formatCommercetoolsMoney', () => {
  it('should format Commercetools money correctly', () => {
    const money = { centAmount: 1000, fractionDigits: 2 };
    // @ts-ignore
    const result = formatCommercetoolsMoney(money);
    expect(result).toBe(10.0);
  });
});

describe('getFluentCustomer', () => {
  it('should return a FluentCustomer', () => {
    const customer = {
      email: 'test@example.com',
      addresses: [{ isDefaultShippingAddress: true, department: 'Dept1' }],
      firstName: 'John',
      lastName: 'Doe',
    };

    // @ts-ignore
    const result = getFluentCustomer(customer);

    expect(result).toEqual({
      username: 'test@example.com',
      department: 'Dept1',
      country: '',
      firstName: 'John',
      lastName: 'Doe',
      primaryEmail: 'test@example.com',
      primaryPhone: '',
      timezone: '',
      promotionOptIn: true,
      retailer: { id: expect.any(Number) },
    });
  });
});

describe('getFluentOrder', () => {
  it('should return a FluentOrder', () => {
    const order = {
      id: 'Order123',
      totalPrice: { currencyCode: 'USD', centAmount: 1000 },
      lineItems: [{ variant: { sku: 'SKU123' }, quantity: 2, price: { value: { currencyCode: 'USD', centAmount: 500 } } }],
      taxedPrice: { totalTax: { currencyCode: 'USD', centAmount: 100 }, totalGross: { currencyCode: 'USD', centAmount: 1100 } },
      shippingAddress: {
        id: 'Address123',
        firstName: 'John',
        lastName: 'Doe',
        streetName: '123 Main St',
        city: 'City',
        postalCode: '12345',
        state: 'State',
        country: 'Country',
      },
    };

    // @ts-ignore
    const result = getFluentOrder(order);

    expect(result).toEqual({
      ref: 'HD_Order123',
      retailer: { id: expect.any(Number) },
      type: 'HD',
      totalPrice: 10.0,
      totalTaxPrice: 1.0,
      items: [
        {
          ref: 'SKU123',
          productRef: 'SKU123',
          productCatalogueRef: expect.any(String),
          quantity: 2,
          price: 5.0,
          paidPrice: 0,
          totalPrice: 0,
          taxPrice: 0,
          totalTaxPrice: 0,
          currency: 'USD',
        },
      ],
      fulfilmentChoice: {
        deliveryType: 'STANDARD',
        deliveryAddress: {
          ref: 'Address123',
          name: 'JohnDoe',
          street: '123 Main St',
          city: 'City',
          postcode: '12345',
          state: 'State',
          country: 'Country',
        },
      },
      customer: { id: expect.any(Number) },
    });
  });
});

describe('getFluentTransaction', () => {
  it('should return a CreateFinancialTransactionInput', () => {
    const payment = {
      transactions: [{ id: 'Transaction123', amount: { currencyCode: 'USD', centAmount: 1000 } }],
      paymentMethodInfo: { method: 'Card', paymentInterface: 'Stripe' },
    };
    const orderId = 123;

    // @ts-ignore
    const result = getFluentTransaction(payment, orderId);

    expect(result).toEqual({
      ref: 'Transaction123',
      type: 'PAYMENT',
      amount: 10.0,
      currency: 'USD',
      paymentMethod: 'Card',
      paymentProvider: 'Stripe',
      order: { id: 123 },
    });
  });
});
