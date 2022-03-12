import { TestContext } from '../lib/testContext'

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config()
}

/* eslint-disable @typescript-eslint/naming-convention */
export const __prod__ = process.env.NODE_ENV === 'production'
export const __pwencription__ = process.env.DECRIPT_KEY
export const __max_servers_allowed__ = 25
export const _apiendpoint_ = process.env.API_ENDPOINT ?? ''
export const _botname_ = process.env.BOT_NAME ?? 'Apollo Servers'
export const _testContext_ = process.env.TEST ? new TestContext() : undefined
