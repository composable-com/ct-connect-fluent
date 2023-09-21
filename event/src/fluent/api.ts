import { FluentClient, fluentGraphQL } from "./client";
import { FluentVariantProduct, FluentStandardProduct, FluentCategory, FluentOrder } from "./types";

const FLUENT_HOST = process.env.FLUENT_HOST ?? '';

export const createCategory = (category: FluentCategory) => {
  return FluentClient.post(`${FLUENT_HOST}/api/v4.1/event/async`, category);
}

export const createStandardProduct = (product: FluentStandardProduct) => {
  return FluentClient.post(`${FLUENT_HOST}/api/v4.1/event/sync`, product);
};

export const createVariantProduct = (product: FluentVariantProduct) => {
  return FluentClient.post(`${FLUENT_HOST}/api/v4.1/event/async`, product);
}

export const createOrder = async (order: FluentOrder) => {
  const CREATE_ORDER_MUTATION = `
    mutation CreateOrder($input: CreateOrderInput!) {
      createOrder(input: $input) {
        id
        createdOn
      }
    }
  `;

  const variables = {
    ...order,
  }

  const response = await fluentGraphQL<{ updateUser: { id: string, name: string } }>({ query: CREATE_ORDER_MUTATION, variables })
}