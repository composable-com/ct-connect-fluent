import { config } from 'dotenv';
config();

import { createApiRoot } from '../client/create.client';
import { assertError } from '../utils/assert.utils';
import { deleteCartUpdateExtension } from './actions';

export async function preUndeploy(): Promise<void> {
  const apiRoot = createApiRoot();
  await deleteCartUpdateExtension(apiRoot);
}

export async function run(): Promise<void> {
  try {
    await preUndeploy();
  } catch (error) {
    assertError(error);
    process.stderr.write(`Pre-undeploy failed: ${error.message}`);
    process.exitCode = 1;
  }
}

run();
