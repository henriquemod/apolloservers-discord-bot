import {
  ListResponse,
  PlayersStatus,
  SingleServerResponse,
  SrvMinimalInfo
} from '../types/responses'
import {
  GetMultiplesServerInfoQuery,
  GetServerInfoQuery
} from '../generated/graphql'
import { isValidProtocol } from './protocols'
import { csgoMap } from './urls/csgoMapsUrl'
import { cssMap } from './urls/cssMapsUrl'
// import { valveThumbsUrls } from './urls/valveThumbsUrls'

const UNDEFINED_APPID = 999

const unkownString = (label: string): string => {
  return label.length > 1 ? label : 'Unknown'
}
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

    // Create link to embend image
    let mapUrl = ''
    let thumbUrl = ''
    // If it pass this, we know is a valve protocol with a valid appid
    if (isValidProtocol(gametype) && typeof type === 'number') {
      if (server.workshop?.preview_url) {
        mapUrl = server.workshop.preview_url
      } else {
        if (type === 730) {
          const map = csgoMap.get(server.map)
          mapUrl = map ?? ''
        }
        if (type === 240) {
          const map = cssMap.get(server.map)
          mapUrl = map ?? ''
        }
      }
      thumbUrl = server.gameDetails?.data?.header_image ?? ''
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

    // Lets create our plaers status list map
    const playersStatus: PlayersStatus[] = []
    server.players.forEach((player) => {
      if (player.name.length !== 0 && typeof player.raw.score === 'string') {
        const score = player.raw.score.length > 1
        if (player.name.length >= 13) {
          player.name = `${player.name.slice(0, 10)}...`
        }
        if (score) {
          playersStatus.push({
            name: player.name,
            score: parseInt(player.raw.score),
            time: parseInt(player.raw.time ?? '0')
          })
        }
      }
    })

    return {
      serverData: {
        title: unkownString(server.name),
        desc: unkownString(desc),
        slots: unkownString(slots),
        connect: unkownString(server.connect),
        players: playersStatus,
        mapUrl,
        tags: unkownString(tags),
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

export const sanitizeListResponse = (
  data: GetMultiplesServerInfoQuery['getMultiplesServerInfo']
): ListResponse | undefined => {
  const build: SrvMinimalInfo[] = []

  const result = data?.response?.filter((server) => server.response)

  if (result && result?.length > 0) {
    result.forEach((server) => {
      if (server.response) {
        const data = server.response
        const playerCount = data.raw.numplayers ?? '-'
        const players = `Slots: ${playerCount}/${data.maxplayers}`
        build.push({
          title: data.name,
          map: data.map,
          players,
          connect: data.connect,
          game: data.raw.game ?? 'Unknown game'
        })
      }
    })
  }
  return {
    servers: build
  }
}
