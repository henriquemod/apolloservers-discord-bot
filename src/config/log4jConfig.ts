import log4js from 'log4js'
import { logTypes } from '../types/logs'

export const logInit = (appenders: logTypes[]): log4js.Log4js =>
  log4js.configure({
    appenders: {
      out: { type: 'stdout' },
      app: { type: 'file', filename: 'logs/application.log' },
      api: { type: 'file', filename: 'logs/api.log' }
    },
    categories: {
      default: { appenders, level: 'debug' }
    }
  })

export const API_ERROR =
  'There was an error when requesting data from the API: '

export const API_RESPONSE_ERROR = 'API replyed with an response error'
export const API_REQUEST_ERROR = 'API replyed with an request error'
export const APP_COMMAND_ERROR = 'There was an error when executing a command'
