import { FluentClient, fluentGraphQL } from "./client";
import { FluentVariantProduct, FluentStandardProduct, FluentCategory, FluentOrder, GraphQlInput, CreateOrderInput, CreateFinancialTransactionInput, CreateOrderAndCustomerInput } from "./types";

const FLUENT_HOST = process.env.FLUENT_HOST ?? '';

export const createCategory = (category: FluentCategory) => {
  return FluentClient.post(`${FLUENT_HOST}/api/v4.1/event/async`, category);
}

export const createStandardProduct = (product: FluentStandardProduct) => {
  return FluentClient.post(`${FLUENT_HOST}/api/v4.1/event/sync`, product);
};

export const createVariantProduct = (product: FluentVariantProduct) => {
  return FluentClient.post(`${FLUENT_HOST}/api/v4.1/event/async`, product);
};

export const createOrderAndCustomer = async (order: GraphQlInput<CreateOrderAndCustomerInput>) => {
  const CREATE_ORDER_AND_CUSTOMER_MUTATION = `
    mutation createOrderAndCustomer ($input: CreateOrderAndCustomerInput) {
      createOrderAndCustomer (input: $input) {
          id
      }
    }
  `
  const variables = {
    ...order,
  }

  const response = await fluentGraphQL<{ data: { createOrderAndCustomer: { id: string } } }>({
    query: CREATE_ORDER_AND_CUSTOMER_MUTATION,
    variables
  });

  return response;
}

export const createOrder = async (order: GraphQlInput<CreateOrderInput>) => {
  const CREATE_ORDER_MUTATION = `
    mutation CreateOrder($input: CreateOrderInput!) {
      createOrder (input: $input) {
        id
      }
    }
  `;

  const variables = {
    ...order,
  }

  const response = await fluentGraphQL<{ data: { createOrder: { id: string } } }>({ 
    query: CREATE_ORDER_MUTATION, 
    variables 
  })

  return response;
}

export const createFinancialTransaction = async (input: GraphQlInput<CreateFinancialTransactionInput>) => {
  const CREATE_FINANCIAL_TRANSACTION_MUTATION = `
    mutation createFinancialTransaction ($input: CreateFinancialTransactionInput) {
      createFinancialTransaction (input: $input) {
          id
          ref
          type
          status
          workflowRef
          workflowVersion
          createdOn
          updatedOn
          total
          currency
          externalTransactionCode
          externalTransactionId
          cardType
          paymentMethod
          paymentProviderName
      }
  }`

  
  const response = await fluentGraphQL({ 
    query: CREATE_FINANCIAL_TRANSACTION_MUTATION, 
    variables: input
  })

  return response
}

export const getCustomerByRef = async (ref: string) => {
  const GET_CUSTOMER_BY_REF_QUERY = `
    query customer ($ref: String!) {
      customer (ref: $ref) {
        id
      }
    }
  `

  const response = await fluentGraphQL<{ data: { customer: { id: string } | null } }>({ 
    query: GET_CUSTOMER_BY_REF_QUERY, 
    variables: {
      ref
    }
  })

  return response
}


