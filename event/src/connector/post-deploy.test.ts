import { assertError } from '../utils/assert.utils'
import * as postDeploy from './post-deploy'
import * as actions from './actions'

jest.mock('../utils/assert.utils', () => ({
  assertError: jest.fn(),
}))

jest.mock('../utils/config.utils', () => ({
  readConfiguration: jest.fn().mockReturnValue({
    projectKey: 'test-project-key',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    scope: 'test-scope',
    region: 'test-region',
  }),
}))

jest.spyOn(actions, 'createMySubscription').mockReturnValue(Promise.resolve())

describe('run function', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('should call postDeploy and handle errors gracefully', async () => {
    const mockError = new Error('Test error')
    const mockErrorMessage = `Post-deploy failed: ${mockError.message}`
    jest.spyOn(actions, 'createMySubscription').mockRejectedValueOnce(mockError)

    const writeSpy = jest.spyOn(process.stderr, 'write')

    await postDeploy.run()

    expect(assertError).toHaveBeenCalledWith(mockError)
    expect(writeSpy).toHaveBeenCalledWith(mockErrorMessage)
  })

  it('should not throw an error when postDeploy succeeds', async () => {
    const mockError = new Error('Test error')
    jest
      .spyOn(postDeploy, 'run')
      .mockImplementationOnce(() => Promise.resolve())
    const writeSpy = jest.spyOn(process.stderr, 'write')
    await postDeploy.run()
    jest.spyOn(actions, 'createMySubscription').mockRejectedValueOnce(mockError)

    expect(assertError).not.toHaveBeenCalled()
    expect(writeSpy).not.toHaveBeenCalled()
  })
})
