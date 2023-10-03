import { config } from 'dotenv';
config();

import { assertError } from '../utils/assert.utils';
import { deleteMySubscription } from './actions';
import { createApiRoot } from '../client/create.client';

export async function preUndeploy(): Promise<void> {
  const apiRoot = createApiRoot();
  await deleteMySubscription(apiRoot);
}

export async function run(): Promise<void> {
  try {
    await preUndeploy();
  } catch (error) {
    assertError(error);
    process.stderr.write(`Post-undeploy failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

run();
