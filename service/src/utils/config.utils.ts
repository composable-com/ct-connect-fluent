import CustomError from '../errors/custom.error';
import envValidators from '../validators/env.validators';
import { getValidateMessages } from '../validators/helpers.validators';

/**
 * Read the configuration env vars
 * (Add yours accordingly)
 *
 * @returns The configuration with the correct env vars
 */
export const readConfiguration = () => {
  const envVars = {
    clientId: process.env.CTP_CLIENT_ID as string,
    clientSecret: process.env.CTP_CLIENT_SECRET as string,
    projectKey: process.env.CTP_PROJECT_KEY as string,
    scope: process.env.CTP_SCOPE,
    region: process.env.CTP_REGION as string,
    basicAuthSecret: process.env.BASIC_AUTH_SECRET as string,
    fluentClientId: process.env.FLUENT_CLIENT_ID as string,
    fluentClientSecret: process.env.FLUENT_CLIENT_SECRET as string,
    fluentUsername: process.env.FLUENT_USERNAME as string,
    fluentPassword: process.env.FLUENT_PASSWORD as string,
    fluentCatalogLocale: (process.env.BLOOMREACH_ENGAGEMENT_CATALOG_LOCALE as string) || 'en-US',
    fluentRetailerId: Number(process.env.FLUENT_RETAILER_ID as string ?? ''),
    fluentWebHookName: process.env.FLUENT_WEBHOOK_NAME as string,
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
      validationErrors
    );
  }

  return envVars;
};
