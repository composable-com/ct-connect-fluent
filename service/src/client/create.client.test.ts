import { createApiRoot } from './create.client'

import { createClient } from './build.client'
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk'
import { readConfiguration } from '../utils/config.utils'

jest.mock('../utils/config.utils')
jest.mock('./build.client', () => {
  return {
    createClient: jest.fn(),
  }
})
jest.mock('@commercetools/platform-sdk')

describe('createApiRoot function', () => {
  const mokcWithProjectKey = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
    ;(readConfiguration as jest.Mock).mockReturnValue({
      projectKey: 'test-project-key',
    })
    ;(createApiBuilderFromCtpClient as jest.Mock).mockReturnValue({
      withProjectKey: mokcWithProjectKey,
    })
  })

  it('should create an API root with the correct project key', () => {
    createApiRoot()
    expect(createClient).toHaveBeenCalled()
    expect(mokcWithProjectKey).toHaveBeenCalledWith({
      projectKey: 'test-project-key',
    })
  })

  it('should return the same API root if called multiple times', () => {
    const apiRoot = createApiRoot()
    expect(apiRoot).toBe(createApiRoot())
  })
})
