
export interface FluentProduct {
  retailerId: string;
  name: string;
  entityRef: string;
  entityType: string;
  entitySubtype: string;
  rootEntityRef: string;
  rootEntityType: string;
}

export interface FluentOrder {
  ref: string;
  retailer: {
    id: string;
  };
  type: 'HD',
  totalPrice: number;
  totalTaxPrice: number;
  customer: {
    id: string;
  };
  items: FluentOrderItem[];
  fulfilmentChoice: {
    deliveryType: string;
    deliveryAddress: {
      ref: string;
      name: string;
      street: string;
      city: string;
      postcode: string;
      state: string;
      country: string;
    }
  }
}

export interface FluentOrderItem {
  ref: string;
  productRef: string;
  productCatalogueRef: string;
  quantity: number;
  price: number;
  paidPrice: number;
  totalPrice: number;
  taxPrice: number;
  totalTaxPrice: number;
  currency: string;
}


export interface FluentStandardProduct extends FluentProduct {
  attributes: StandardProductAttributes;
}

export interface FluentVariantProduct extends FluentProduct {
  attributes: VariantProductAttributes;
}

export interface StandardProductAttributes {
  ref: string;
  type: string;
  status: string;
  gtin?: string;
  name: string;
  summary?: string;
  attributes?: StandardProductSubAttributes[];
  categoryRefs: string[] | [];
  prices?: Price[];
}

export interface VariantProductAttributes extends StandardProductAttributes {
  standardProductRef: string;
}

export interface StandardProductSubAttributes {
  name: string;
  type: string;
  value: string;
}

export interface Price {
  type: string;
  currency: string;
  value: number;
}


export interface FluentCategory {
  retailerId:    string;
  name:          string;
  entityRef:     string;
  entityType:    string;
  entitySubtype: string;
  attributes:    FluentCategoryAttributes;
}

export interface FluentCategoryAttributes {
  ref:     string;
  type:    string;
  status:  string;
  name:    string;
  summary: string;
}
