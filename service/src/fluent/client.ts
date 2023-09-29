import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { isFuture } from 'date-fns'
import { logger } from '../utils/logger.utils'

interface CommonHeaderProperties extends AxiosRequestHeaders {
  ExpiredAt: string
}

export const FLUENT_CLIENT_CREDENTIALS = {
  CLIENT_ID: process.env.FLUENT_CLIENT_ID || '',
  CLIENT_SECRET: process.env.FLUENT_CLIENT_SECRET || '',
  USERNAME: process.env.FLUENT_USERNAME || '',
  PASSWORD: process.env.FLUENT_PASSWORD || '',
}

export const FLUNT_BASE_URLS = {
  FLUENT_HOST: process.env.FLUENT_HOST || '',
}

const { CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD } = FLUENT_CLIENT_CREDENTIALS
const { FLUENT_HOST } = FLUNT_BASE_URLS

export const FluentClient = axios.create()

const setDefaultHeader = (key: string, value: string) => {
  FluentClient.defaults.headers.common[key] = value
}

const getAccessToken = async (clientId: string, clientSecret: string, username: string, password: string) => {
  const axiosInstance = axios.create()
  return axiosInstance
    .post(
      `${FLUENT_HOST}/oauth/token`,
      {},
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          username: username,
          password: password,
          grant_type: 'password',
          scope: 'api',
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      logger.error('Error trying to get access token', err.message)
      throw err
    })
}

const addSeconds = (date: Date, seconds: number) => {
  return new Date(date.getTime() + seconds * 1000).getTime().toString()
}

let isLogged = false
export const fluentLogin = async (forceLogin?: boolean) => {
  if (!isLogged || forceLogin) {
    const accessToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD)
    setDefaultHeader(
      'Authorization',
      `${accessToken.token_type} ${accessToken.access_token}`
    )

    setDefaultHeader(
      'ExpiredAt',
      `${addSeconds(new Date(), accessToken.expires_in)}`
    )
    isLogged = true
  }
}

interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
}

export const fluentGraphQL = async <T = any>({ query, variables }: GraphQLRequest): Promise<T> => {
  await fluentLogin()

  const response = await FluentClient.post<T>(
    `${FLUENT_HOST}/graphql`,
    { query, variables },
    { headers: FluentClient.defaults.headers.common }
  )

  return response.data
}

FluentClient.interceptors.request.use(async (request) => {
  const commonHeaders = request.headers
    ?.common as unknown as CommonHeaderProperties
  const expiresAt = Number(commonHeaders?.['ExpiredAt'] ?? -1)
  if (expiresAt < 0) return request

  if (!isFuture(expiresAt)) {
    await fluentLogin(true)
  }

  return request
})
