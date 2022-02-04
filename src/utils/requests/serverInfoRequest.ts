import axios from 'axios'
import { logInit, API_ERROR } from '../../config/log4jConfig'
import {
  GetServerInfoQuery,
  GetMinimalServerinfoQuery,
  QueryGetMultiplesServerInfoArgs,
  GetMultiplesMinimalServerInfoQuery,
  GetServerInfoQueryVariables
} from '../../generated/graphql'
import { _apiendpoint_ } from '../constants'

const log = logInit(['api', 'out']).getLogger('API')

interface Props {
  host: string
  port: number
  apiKey: string
}

// ! Single Server - Complete
export const serverInfoRequest = async (
  props: GetServerInfoQueryVariables
): Promise<GetServerInfoQuery | undefined> => {
  try {
    const restult = await axios({
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
                raw {
                  numplayers
                  tags
                  appId
                }
                players {
                  name
                  raw {
                    score
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
    log.info('REQUEST DATA: ', restult.data.data as GetServerInfoQuery)
    return restult.data.data as GetServerInfoQuery
  } catch (error) {
    log.error(API_ERROR, error)
  }
}

// ! Multiples Servers - Minimal
export const multiplesMinimalServerRequest = async (
  props: QueryGetMultiplesServerInfoArgs
): Promise<GetMultiplesMinimalServerInfoQuery | undefined> => {
  try {
    let query = '['
    props.servers.forEach((server) => {
      query += `{ host: ${server.host}, port: ${server.port}, type: ${server.type}} `
    })
    query += ']'

    const restult = await axios({
      url: _apiendpoint_,
      method: 'post',
      data: {
        query: `
        query test {
          getMultiplesServerInfo(apikey: "${props.apikey}", servers: ${query}) {
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
          }
        }
        `
      }
    })

    return restult.data.data as GetMultiplesMinimalServerInfoQuery
  } catch (error) {
    log.error(API_ERROR, error)
  }
}

export const minimalServerInfoRequest = async (
  props: Props
): Promise<GetMinimalServerinfoQuery | undefined> => {
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

    return restult.data.data as GetMinimalServerinfoQuery
  } catch (error) {
    log.error(API_ERROR, error)
  }
}
