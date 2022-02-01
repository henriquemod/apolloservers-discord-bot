import axios from 'axios'
import { GetServerInfoQuery } from 'src/generated/graphql'

export const testThisShit = async (): Promise<GetServerInfoQuery> => {
  const restult = await axios({
    url: 'http://localhost:4000/graphql',
    method: 'post',
    data: {
      query: `
        query test {
          getServerInfo(apikey: "2f7d2bf1-6f47-42be-a38b-91fb30f89ed0", server: {host: "192.168.1.3", port: 29001, type: "csgo"}) {
            response {
              name
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
