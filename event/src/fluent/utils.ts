import { Category, CategoryReference, Order, ProductVariant } from "@commercetools/platform-sdk";
import { FluentOrder, FluentOrderItem, FluentStandardProduct, FluentVariantProduct } from "./types";
import { TypedMoney } from '@commercetools/platform-sdk';


const FLUENT_CATALOGUE_REF = process.env.FLUENT_CATALOGUE_REF ?? '';
const FLUENT_RETAILER_ID = process.env.FLUENT_RETAILER_ID ?? '';

export const getFluentStandardProduct = (params: {
  productName: string
  productCategories?: string[],
  productDescription?: string,
  productKey: string,
}): FluentStandardProduct => {
  const {  productCategories, productName, productKey, productDescription } = params;

  return {
    "retailerId": FLUENT_RETAILER_ID,
    "name": "UPSERT_PRODUCT",
    "entityRef": FLUENT_CATALOGUE_REF,
    "entityType": "PRODUCT_CATALOGUE",
    "entitySubtype": "MASTER",
    "rootEntityRef": FLUENT_CATALOGUE_REF,
    "rootEntityType": "PRODUCT_CATALOGUE",
    "attributes": {
      "ref": productKey, // I will use this ref for the variants, if SKU is not defined the product will not get syncronyzed
      "type": "STANDARD",
      "status": "ACTIVE",
      "gtin": "NOTFORSALE", // The Standard Product is NOTFORSALE
      "name": productName,
      "summary": productDescription,
      "categoryRefs": productCategories ?? [],
    }
  }
}

export const getProductFluentCategories = (fluentCategories: Category[]) => {
  return fluentCategories.map((category) => category.key);
}

export const getFluentProductVariant = (params: {
  product: ProductVariant,
  productName: string,
  productDescription?: string,
  fluentStandardProductRef: string,
  fluentCategories: string[] | [],
 }): FluentVariantProduct => {
  const { product, fluentCategories, fluentStandardProductRef, productName, productDescription } = params;

  const fluentImages = product.images?.map((image) => ({
    name: 'imageUrl',
    type: 'STRING',
    value: image.url,
  }));

  const fluentPrices = product.prices?.map((price) => ({
    type: 'TYPE',
    currency: price.value.currencyCode,
    value: price.value.centAmount / 100,
  }));

  const fluentAttributes = product.attributes?.map((attribute) => ({
    name: attribute.name,
    type: 'STRING',
    value: attribute.value['key'] ? attribute.value.label : attribute.value,
  }));

  return {
    "retailerId": FLUENT_RETAILER_ID,
    "name": "UPSERT_PRODUCT",
    "entityRef": FLUENT_CATALOGUE_REF,
    "entityType": "PRODUCT_CATALOGUE",
    "entitySubtype": "MASTER",
    "rootEntityRef": FLUENT_CATALOGUE_REF,
    "rootEntityType": "PRODUCT_CATALOGUE",
    "attributes": {
      "ref": product.sku!,
      "type": "VARIANT",
      "status": "ACTIVE",
      "gtin": "D45", // The Variant Product is D45 it has to be present in order to display the product in fluent
      "name": productName, // From CT I only have the SKU, what should I use here?
      "summary": productDescription, // same here
      "standardProductRef": fluentStandardProductRef,
      "attributes": [
        ...(fluentImages && fluentImages?.length > 0 ? fluentImages : []),
        ...(fluentAttributes && fluentAttributes?.length > 0 ? fluentAttributes : []),
      ],
      "categoryRefs": fluentCategories,
      "prices": fluentPrices,
    }
  }
}

export const getFluentCategory = (category: Category) => {
  if (!category.key) return;

  return {
    "retailerId": FLUENT_RETAILER_ID,
    "name": "UPSERT_CATEGORY",
    "entityRef": FLUENT_CATALOGUE_REF,
    "entityType": "PRODUCT_CATALOGUE",
    "entitySubtype": "MASTER",
    "attributes": {
      "ref": category.key,
      "type": "DEFAULT",
      "status": "ACTIVE",
      "name": category.name['en-US'],
      "summary": category.description?.['en-US'] || 'No description',
    }
  }
}

export const getFluentCategoriesFromCTCategories = (productCategories: CategoryReference[], allCategories: Category []) => {
  const fluentCategories = productCategories
    .map((category) => allCategories.find(({ id }) => category.id === id))
    .filter(category => category?.key)
    .map((category) => category?.key as string);

    return fluentCategories;
}


export const formatCommercetoolsMoney = (money?: TypedMoney) => {
  return (money?.centAmount ?? 0) / Math.pow(10, money?.fractionDigits ?? 2);
};

export const getFluentOrder = (order: Order): FluentOrder | null => {
  const { totalPrice, lineItems, taxedPrice, shippingAddress } = order;
  if (!order.customerId) return null;

  const currencyCode = totalPrice.currencyCode;

  const fluentLineItems: FluentOrderItem[] = lineItems.map((lineItem) => ({
    ref: lineItem.variant.sku!,
    productRef: lineItem.variant.sku!,
    productCatalogueRef: FLUENT_CATALOGUE_REF,
    quantity: lineItem.quantity,
    price: formatCommercetoolsMoney(lineItem.price.value),
    paidPrice: formatCommercetoolsMoney(lineItem.totalPrice),
    totalPrice: formatCommercetoolsMoney(lineItem.totalPrice),
    taxPrice: formatCommercetoolsMoney(lineItem.taxedPrice?.totalTax),
    totalTaxPrice: formatCommercetoolsMoney(lineItem.taxedPrice?.totalGross),
    currency: currencyCode,
  }));

  return {
    ref: `HD_${order.id}`,
    retailer: {
      id: FLUENT_RETAILER_ID
    },
    type: 'HD',
    totalPrice: formatCommercetoolsMoney(totalPrice),
    totalTaxPrice: formatCommercetoolsMoney(taxedPrice?.totalTax),
    customer: {
      id: order.customerId,
    },
    items: fluentLineItems,
    fulfilmentChoice: {
      deliveryType: 'STANDARD',
      deliveryAddress: {
        ref: shippingAddress?.id ?? '', // What should I use here?
        name: (shippingAddress?.firstName  ?? '') + (shippingAddress?.lastName ?? ''),
        street: shippingAddress?.streetName ?? '',
        city: shippingAddress?.city ?? '',
        postcode: shippingAddress?.postalCode ?? '',
        state: shippingAddress?.state ?? '',
        country: shippingAddress?.country ?? '',
      }
    }
  }
}