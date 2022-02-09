import axios from 'axios'
import { Guild } from 'discord.js'
import WOKCommands from 'wokcommands'
import log4jConfig, { API_ERROR } from '../../config/log4jConfig'
import {
  GetMultiplesServerInfoQuery,
  GetServerInfoQuery,
  GetServerInfoQueryVariables,
  QueryGetMultiplesServerInfoArgs
} from '../../generated/graphql'
import { _apiendpoint_ } from '../constants'

const log = log4jConfig(['api', 'out']).getLogger('API')

interface Props {
  host: string
  port: number
  apiKey: string
  instance: WOKCommands
  guild: Guild
}

interface ServerInfoProps extends GetServerInfoQueryVariables {
  instance: WOKCommands
  guild: Guild
}

interface MultiServerInfoProps extends QueryGetMultiplesServerInfoArgs {
  instance: WOKCommands
  guild: Guild
}

// ! Single Server - Complete
export const serverInfoRequest = async (
  props: ServerInfoProps
): Promise<GetServerInfoQuery | null> => {
  return await axios({
    url: _apiendpoint_,
    method: 'post',
    data: {
      query: `
          query serverInfo {
            getServerInfo(apikey: "${props.apikey}", server: {host: "${props.host}", port: ${props.port}, type: "${props.type}"}) {
              response {
                name
                connect
                map
                maxplayers
                workshop {
                  preview_url
                }
                gameDetails {
                  success
                  data {
                    header_image
                  }
                }
                raw {
                  numplayers
                  tags
                  appId
                }
                players {
                  name
                  raw {
                    score
                    time
                  }
                }
              }
              errors {
                errorType
                message
              }
            }
          }
          `
    }
  })
    .then((result) => result.data.data as GetServerInfoQuery)
    .catch((error) => {
      if (
        error.code === 'ECONNREFUSED' ||
        error.response?.status === 404 ||
        error.code === 'ENOTFOUND'
      ) {
        return {
          getServerInfo: {
            errors: [
              {
                errorType: 'API Request Error',
                message: props.instance.messageHandler.get(
                  props.guild,
                  'API_REQUEST_ERROR'
                )
              }
            ]
          }
        } as GetServerInfoQuery
      }

      log.error(API_ERROR, error)
      return null
    })
}

// ! Multiples Servers - Minimal
export const multiplesMinimalServerRequest = async (
  props: MultiServerInfoProps
): Promise<GetMultiplesServerInfoQuery | null> => {
  let query = '['
  props.servers.forEach((server) => {
    query += `{ host: ${server.host}, port: ${server.port}, type: ${server.type}} `
  })
  query += ']'

  return await axios({
    url: _apiendpoint_,
    method: 'post',
    data: {
      query: `
        query multiplesServerInfo {
          getMultiplesServerInfo(apikey: "${props.apikey}", servers: ${query}) {
            response {
              response {
                name
                map
                maxplayers
                raw {
                  numplayers
                  game
                }
                connect
              }
              errors {
                errorType
                message
              }
            }
            errors {
              errorType
            }
          }
        }
        `
    }
  })
    .then((result) => result.data.data as GetMultiplesServerInfoQuery)
    .catch((error) => {
      if (
        error.code === 'ECONNREFUSED' ||
        error.response?.status === 404 ||
        error.code === 'ENOTFOUND'
      ) {
        return {
          getMultiplesServerInfo: {
            errors: [
              {
                errorType: 'API Request Error',
                message: props.instance.messageHandler.get(
                  props.guild,
                  'API_REQUEST_ERROR'
                )
              }
            ]
          }
        } as GetMultiplesServerInfoQuery
      }
      log.error(API_ERROR, error)
      return null
    })
}

export const minimalServerInfoRequest = async (
  props: Props
): Promise<GetServerInfoQuery | undefined> => {
  try {
    const restult = await axios({
      url: _apiendpoint_,
      method: 'post',
      data: {
        query: `
          query test {
            getServerInfo(apikey: "${props.apiKey}", server: {host: "${props.host}", port: ${props.port}, type: "csgo"}) {
              response {
                name
                map
                maxplayers
                raw {
                  numplayers
                }
                connect
              }
              errors {
                errorType
                message
              }
            }
          }
          `
      }
    })

    return restult.data.data as GetServerInfoQuery
  } catch (error) {
    log.error(API_ERROR, error)
  }
}
