import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

const MY_SUBSCRIPTION_KEY = 'ct-connect-fluent-subscription';

export async function createMySubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  topicName: string,
  projectId: string
): Promise<void> {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${MY_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: MY_SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: MY_SUBSCRIPTION_KEY,
        destination: {
          type: 'GoogleCloudPubSub',
          topic: topicName,
          projectId,
        },
        format: {
          type: 'CloudEvents',
          cloudEventsVersion: '1.0',
        },
        messages: [
          {
            resourceTypeId: 'product',
            types: ['ProductPublished'],
          },
          {
            resourceTypeId: 'order',
            types: ['OrderCreated'],
          }
        ],
      },
    })
    .execute();
}

export async function deleteMySubscription(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${MY_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: MY_SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}
