import axios from 'axios'
import {
  logInit,
  API_ERROR,
  API_RESPONSE_ERROR,
  API_REQUEST_ERROR
} from '../../config/log4jConfig'
import {
  GetServerInfoQuery,
  QueryGetMultiplesServerInfoArgs,
  GetServerInfoQueryVariables,
  GetMultiplesServerInfoQuery
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
      if (error.response) {
        log.error(API_RESPONSE_ERROR, {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        })
      } else if (error.request) {
        log.error(API_REQUEST_ERROR, {
          error: error.request
        })
      } else {
        log.error(API_ERROR, error.message)
      }
      return null
    })
}

// ! Multiples Servers - Minimal
export const multiplesMinimalServerRequest = async (
  props: QueryGetMultiplesServerInfoArgs
): Promise<GetMultiplesServerInfoQuery | null> => {
  let query = '['
  props.servers.forEach((server) => {
    query += `{ host: ${server.host}, port: ${server.port}, type: ${server.type}} `
  })
  query += ']'

  // console.log(
  //   'QUERY',
  //   `
  //   query multiplesServerInfo {
  //     getMultiplesServerInfo(apikey: "${props.apikey}", servers: ${query}) {
  //       response {
  //         response {
  //           name
  //           map
  //           maxplayers
  //           raw {
  //             numplayers
  //             game
  //           }
  //           connect
  //         }
  //         errors {
  //           errorType
  //           message
  //         }
  //       }
  //       errors {
  //         errorType
  //       }
  //     }
  //   }
  //     `
  // )

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
      if (error.response) {
        log.error(API_RESPONSE_ERROR, {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        })
      } else if (error.request) {
        log.error(API_REQUEST_ERROR, {
          error: error.request
        })
      } else {
        log.error(API_ERROR, error.message)
      }
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
