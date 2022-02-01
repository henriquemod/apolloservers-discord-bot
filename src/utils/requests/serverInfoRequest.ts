/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from 'axios'
// import { SingleServer } from '../../types/server'
import {
  GetServerInfoQuery,
  GetMinimalServerinfoQuery,
  QueryGetMultiplesServerInfoArgs,
  GetMultiplesMinimalServerInfoQuery
} from '../../generated/graphql'

interface Props {
  host: string
  port: number
  apiKey: string
}

// interface MultiplesServers {
//   apiKey: string
//   servers: QueryGetMultiplesServerInfoArgs
// }

export const serverInfoRequest = async (
  props: QueryGetMultiplesServerInfoArgs
): Promise<GetServerInfoQuery> => {
  const restult = await axios({
    url: 'http://localhost:4000/graphql',
    method: 'post',
    data: {
      query: `
        query test {
          getServerInfo(apikey: "${props.apikey}", servers: ${props.servers}) {
            response {
              name
              connect
              map
              raw {
                numplayers
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

  return restult.data.data as GetServerInfoQuery
}

// ! Multiples Servers - Minimal
export const multiplesMinimalServerRequest = async (
  props: QueryGetMultiplesServerInfoArgs
): Promise<GetMultiplesMinimalServerInfoQuery> => {
  let query = '['
  props.servers.forEach((server) => {
    query += `{ host: ${server.host}, port: ${server.port}, type: ${server.type}} `
  })
  query += ']'

  // console.log(`
  // query test {
  //   getMultiplesServerInfo(apikey: "${props.apikey}", servers: ${query}) {
  //     response {
  //       name
  //       map
  //       maxplayers
  //       raw {
  //         numplayers
  //       }
  //       connect
  //     }
  //   }
  // }
  // `)

  const restult = await axios({
    url: 'http://localhost:4000/graphql',
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
              }
              connect
            }
          }
        }
        `
    }
  })
  // return null
  return restult.data.data as GetMultiplesMinimalServerInfoQuery
}

export const minimalServerInfoRequest = async (
  props: Props
): Promise<GetMinimalServerinfoQuery> => {
  const restult = await axios({
    url: 'http://localhost:4000/graphql',
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
}
