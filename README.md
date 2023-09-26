# commercetools FluentCommerce Connector

## Overview

The application receives events (like product publication or order creation) from commercetools, processes them, and then creates corresponding entities in FluentCommerce.

This is achieved through a POST endpoint which receives the event, processes it, and depending on the event type, either creates a product or an order in FluentCommerce.

## Pre-requisites
  - FluentCommerce retail account
  - FluentCommerce Lingo account
  - commercetools account
  - [commercetools API keys](https://docs.commercetools.com/getting-started/create-api-client) (“Admin client”)

## Installing the connector
In order to install the connector in your commercetools project, you'll need to deploy it. Refer to the [commercetools connect deployment documentation](https://docs.commercetools.com/connect/concepts#deployments).

Setup the required environment variables when you [create the deployment](https://docs.commercetools.com/connect/getting-started#create-a-deployment):

- `CTP_CLIENT_ID`
- `CTP_CLIENT_SECRET`
- `CTP_PROJECT_KEY`
- `CTP_SCOPE`
- `CTP_REGION`
- `FLUENT_CLIENT_SECRET`
- `FLUENT_CLIENT_ID`
- `FLUENT_USERNAME`
- `FLUENT_PASSWORD`
- `FLUENT_HOST`
- `FLUENT_CATALOGUE_REF`
- `FLUENT_RETAILER_ID`
- `FLUENT_CATALOG_LOCALE`

Once the connector is deployed, it should trigger the [`postDeploy` script](https://docs.commercetools.com/connect/convert-existing-integration#postdeploy).

The post-deploy script will create a commercetools API subscription to listen to “[Order Created](https://docs.commercetools.com/api/projects/messages#order-created)” and “[Product Published](https://docs.commercetools.com/api/projects/messages#product-published)” [messages](https://docs.commercetools.com/api/projects/messages) . Each time an order is created or a product is published, the commercetools API will send a message to the connector.

## Uninstalling the connector

In order to uninstall the connector, you’ll need to [send the appropriate HTTP request and delete it](https://docs.commercetools.com/connect/deployments#delete-deployment).

This will trigger the [`preUndeploy` script](https://docs.commercetools.com/connect/convert-existing-integration#preundeploy) which will delete the messages subscriptions described on the “Installing the connector” section.

## How it works


### Processing Product Changes and first sync

When the connector is getting deployed, it will get all your commercetools products and create them in FluentCommerce. We currently don't support Product Categories.

When a product is published on commercetools, an event of type 'ProductPublished' is received. The application checks if this product has a key. If there isn't one, the product is not processed. 

If a product key exists, the application proceeds to create or update a 'standard product' and its 'variants' in FluentCommerce. 

If a product key exists, but the variant has an SKU equals to that key, we won't process the product. This is because standard products should have a unique Ref in FluentCommerce, and SKU will be used for Ref in variants.

The standard product, which represents the main product, includes details like the product name, description. The variants represent different forms of the product, like different sizes or colors and include similar information as the standard product, along with their SKU (Stock Keeping Unit).

### Processing Order Creation 

When an order is created on commercetools, an event of type 'OrderCreated' is received. The application checks if this order has a customer email and customer ID. If these fields don't exist, the order is not processed. 

If they do, the application proceeds to create an order in FluentCommerce. If the customer associated with the order doesn't exist in FluentCommerce, a new customer is created along with the order. 

If there are payments associated with the order, a financial transaction is created in FluentCommerce.

## FAQ

### Why do we need the `FLUENT_CATALOG_LOCALE` env variable?

- By default, commercetools has built-in i18n support. In order to consume the catalog data, we must specify the desired [`LocalizedString`](https://docs.commercetools.com/api/types#localizedstring).



