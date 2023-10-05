# commercetools Fluent Commerce Connector

The Fluent Commerce commercetools connector was created by [Orium](https://orium.com/), and provides the following features:
- Ability to capture customer order events from commercetools to Fluent, including payment transaction details.
- Ability to initially load all products from commercetools to Fluent Commerce when the connector is installed.
- Ability to continuously synchronize products from commercetools to Fluent Commerce in near real-time.
- Ability to update Order status on commercetools when the order is completed on Fluent Commerce.

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

For service you will need to add the following environment variables:
- `FLUENT_WEBHOOK_NAME`
- `BASIC_AUTH_SECRET`

Once the connector is deployed, it should trigger the [`postDeploy` script](https://docs.commercetools.com/connect/convert-existing-integration#postdeploy).

The post-deploy script will create a commercetools API subscription to listen to “[Order Created](https://docs.commercetools.com/api/projects/messages#order-created)” and “[Product Published](https://docs.commercetools.com/api/projects/messages#product-published)” [messages](https://docs.commercetools.com/api/projects/messages) . Each time an order is created or a product is published, the commercetools API will send a message to the connector.

## Uninstalling the connector

In order to uninstall the connector, you’ll need to [send the appropriate HTTP request and delete it](https://docs.commercetools.com/connect/deployments#delete-deployment).

This will trigger the [`preUndeploy` script](https://docs.commercetools.com/connect/convert-existing-integration#preundeploy) which will delete the messages subscriptions described on the “Installing the connector” section.

### Post Deploy Steps (recommended)

During installation this connector sets up subscription listen for any product publish and updates or insert the product on Fluent. However, after installation, we recommend triggering a manual first time sync in order to have your data imported into Fluent as soon as possible. Follow the steps below to trigger the first product sync.

1 - Execute a GET request to retrieve your Service URL:

```bash
curl --get https://connect.us-central1.gcp.commercetools.com/{{ CTP_CLIENT_ID }}/deployments/key={{ COMMERCETOOLS_DEPLOYMENT_KEY }} \
--header 'Authorization: Bearer {{ access_token }}' | json_pp | grep https://
```

> _Replace `{{ CTP_CLIENT_ID }}` and `{{ COMMERCETOOLS_DEPLOYMENT_KEY }}` with the values used when creating the deployment._
>
> _[How to get the {{ access_token }}?](https://docs.commercetools.com/api/authorization#client-credentials-flow)_

The url will look like this `https://service-2da6408a-5e4e-493e-a413-c248f2c37174.us-central1.gcp.preview.commercetools.app/service`

2 - After retrieving the Service URL, send a GET request to trigger the products sync.

```bash
curl -u {{ CTP_PROJECT_KEY }}:{{ BASIC_AUTH_SECRET }} \
https://service-2da6408a-5e4e-493e-a413-c248f2c37174.us-central1.gcp.preview.commercetools.app/service/fluent-catalog-ingestion
```

> _Replace `{{ CTP_PROJECT_KEY }}` and `{{ BASIC_AUTH_SECRET }}` with the values you used when creating the deployment._
> 
> _Replace `https://service-2da6408a-5e4e-493e-a413-c248f2c37174.us-central1.gcp.preview.commercetools.app/service` with the service url you got in the previous step._


## How it works


### Processing Product Changes

When a product is published on commercetools, an event of type 'ProductPublished' is received. The application checks if this product has a key. If there isn't one, the product is not processed. 

If a product key exists, the application proceeds to create or update a 'standard product' and its 'variants' in FluentCommerce. 

If a product key exists, but the variant has an SKU equals to that key, the connector will not process the product. This is because standard products should have a unique Ref in FluentCommerce, and SKU will be used for Ref in variants.

The standard product, which represents the main product, includes details like the product name, description. The variants represent different forms of the product, like different sizes or colors and include similar information as the standard product, along with their SKU (Stock Keeping Unit).

### Processing Order Creation 

When an order is created on commercetools, an event of type 'OrderCreated' is received. The application checks if this order has a customer email and customer ID. If these fields don't exist, the order is not processed. 

If they do, the application proceeds to create an order in FluentCommerce. If the customer associated with the order doesn't exist in FluentCommerce, a new customer is created along with the order. 

If there are payments associated with the order, a financial transaction is created in FluentCommerce.

### Processing Order Complete Update

When an order is updated on Fluent, an WebHook will be triggered and the connector will update the order on commercetools. You will have to configure out the workflow on Fluent to trigger the WebHook when an order is COMPLETED. You should set the `FLUENT_WEBHOOK_NAME` env variable with the name of the WebHook you created on Fluent.


## FAQ

### Why do we need the `FLUENT_CATALOG_LOCALE` env variable?

- By default, commercetools has built-in i18n support. In order to consume the catalog data, we must specify the desired [`LocalizedString`](https://docs.commercetools.com/api/types#localizedstring).

### What is the `BASIC_AUTH_SECRET` env variable for?

- Fluent will consume products data from an endpoint exposed by the connector. This endpoint is secured using a [basic http authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication), where the username is the `CTP_PROJECT_KEY` and the password the `BASIC_AUTH_SECRET`.

### Why do we need the `FLUENT_WEBHOOK_NAME` env variable?

- Since the Webhook endpoint will no have proteccion by default, we need to make sure only the Fluent Webhook will be able to trigger the endpoint. The `FLUENT_WEBHOOK_NAME` env variable will be used to validate the request.

## Useful links
- https://lingo.fluentcommerce.com/asset-library/reference-modules/order/
- https://lingo.fluentcommerce.com/overview/getting-started/glossary/
- https://lingo.fluentcommerce.com/apis/graphql/
- https://lingo.fluentcommerce.com/apis/rest/v4.1/event-api/
