import { SingleServerResponse } from '../types/responses'
import { GetServerInfoQuery } from '../generated/graphql'
import { isValidProtocol } from './protocols'
import { csgoMap } from './urls/csgoMapsUrl'
import { valveThumbsUrls } from './urls/valveThumbsUrls'

const UNDEFINED_APPID = 999

export const sanitizeResponse = (
  data: GetServerInfoQuery['getServerInfo'],
  gametype: string,
  desc: string
): SingleServerResponse | undefined => {
  if (data?.response) {
    // Load add data
    const server = data.response
    const type = data.response.raw.appId ?? UNDEFINED_APPID

    // Mount slots
    const numPlayers = server.raw.numplayers ?? '-'
    const maxPlayers = server.maxplayers ?? '-'
    const slots = `${numPlayers}/${maxPlayers}`

    // Lets create our players list string
    let playersList = ''
    server.players.forEach((player) => {
      if (player.name.length !== 0 && typeof player.raw.score === 'string') {
        playersList += ` ${player.name}  \\ `
      }
    })
    playersList =
      playersList.length > 1 ? playersList.slice(0, playersList.length - 2) : ''

    // Create link to embend image
    let mapUrl = ''
    let thumbUrl = ''
    // If it pass this, we know is a valve protocol with a valid appid
    if (isValidProtocol(gametype) && typeof type === 'number') {
      console.log('GAMETYPE: ', type)

      if (type === 730) {
        const map = csgoMap.get(server.map)
        mapUrl = map ?? ''
      }
      thumbUrl = valveThumbsUrls.get(type) ?? ''
    }

    thumbUrl =
      thumbUrl.length > 1
        ? thumbUrl
        : 'https://i.pinimg.com/originals/c5/96/a1/c596a1456bc7af81a00b97da320f80f8.jpg'

    // Lets create our tags list string
    let tags = 'Tags: '
    server.raw.tags?.forEach((tag) => {
      tags += `${tag}, `
    })

    tags = tags.length > 1 ? tags.slice(0, tags.length - 2) : ''

    return {
      serverData: {
        title: server.name,
        desc,
        slots,
        connect: server.connect,
        players: playersList,
        mapUrl: mapUrl,
        tags,
        thumbUrl
      },
      errors: undefined
    }
  } else if (data?.errors) {
    // Load errors
    return {
      errors: data.errors.map((error) => ({
        errorType: error.errorType,
        message: error.message
      }))
    }
  }
}
