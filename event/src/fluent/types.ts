
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
    id: number;
  };
  type: string,
  totalPrice: number;
  totalTaxPrice: number;
  customer: { id: number };
  items: FluentOrderItem[];
  fulfilmentChoice: FulfilmentChoice;
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



export interface GraphQlInput<T> {
  input: T;
}

export interface CreateFinancialTransactionInput {
  ref: string
  type: string
  amount: number
  currency: string
  externalTransactionCode?: string
  externalTransactionId?: string
  cardType?: string
  paymentMethod: string | undefined
  paymentProvider: string | undefined
  order: {
    id: number
  }
}

export interface CreateOrderInput {
  ref: string;
  type: string;
  attributes?: Attributes;
  retailer: {
    id: number;
  };
  totalPrice: number;
  totalTaxPrice: number;
  payment?: Payment;
  fulfilmentChoice: FulfilmentChoice;
  customer: {
    id: number;
  };
  items: FluentOrderItem[];
}

export interface CreateOrderAndCustomerInput {
  ref: string;
  type: string;
  attributes?: Attributes;
  retailer: {
    id: number;
  };
  totalPrice: number;
  totalTaxPrice: number;
  payment?: Payment;
  fulfilmentChoice: FulfilmentChoice;
  items: FluentOrderItem[];
  customer: CreateCustomerInput;
}

export interface Attributes {
  name:  string;
  type:  string;
  value: string;
}

export interface CreateCustomerInput {
  username:       string;
  attributes?:     Attributes;
  title?:          string;
  department:     string;
  country:        string;
  firstName:      string;
  lastName:       string;
  primaryEmail:   string;
  primaryPhone:   string;
  timezone:       string;
  promotionOptIn: boolean;
  retailer:       {
    id: number;
  };
}

export interface FulfilmentChoice {
  currency?:            string;
  deliveryInstruction?: string;
  deliveryType:        string;
  fulfilmentPrice?:     string;
  fulfilmentTaxPrice?:  string;
  fulfilmentType?:      string;
  pickupLocationRef?:   string;
  deliveryAddress:     DeliveryAddress;
}

export interface DeliveryAddress {
  ref:         string;
  companyName?: string;
  name:        string;
  street:      string;
  city:        string;
  state:       string;
  postcode:    string;
  region?:      string;
  country:     string;
  latitude?:    string;
  longitude?:   string;
  timeZone?:    string;
}

export interface FluentOrderItem {
  ref:                 string;
  productRef:          string;
  productCatalogueRef: string;
  quantity:            number;
  paidPrice:           number;
  currency:            string;
  price:               number;
  taxPrice:            number;
  taxType?:            string;
  totalPrice:          number;
  totalTaxPrice:       number;
  attributes?:         Attributes;
}

export interface Payment {
  ref: string;
}
