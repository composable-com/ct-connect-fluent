import { createClient } from './build.client'
import { ClientBuilder } from '@commercetools/sdk-client-v2'
import { readConfiguration } from '../utils/config.utils'

jest.mock('../utils/config.utils')
jest.mock('@commercetools/sdk-client-v2')
jest.mock('../middleware/auth.middleware', () => ({
  authMiddlewareOptions: jest.fn(),
}))
jest.mock('../middleware/http.middleware', () => ({
  httpMiddlewareOptions: jest.fn(),
}))

describe('createClient function', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
    ;(readConfiguration as jest.Mock).mockReturnValue({
      projectKey: 'test-project-key',
    })
    ;(ClientBuilder as jest.Mock).mockReturnValue({
      withProjectKey: jest.fn().mockReturnThis(),
      withClientCredentialsFlow: jest.fn().mockReturnThis(),
      withHttpMiddleware: jest.fn().mockReturnThis(),
      build: jest.fn(),
    })
  })

  it('should create a new Client with the correct configuration', () => {
    createClient()
    expect(ClientBuilder).toHaveBeenCalled()
  })
})
