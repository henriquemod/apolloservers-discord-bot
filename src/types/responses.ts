export interface SingleServer {
  title: string
  desc: string
  slots: string
  connect: string
  players: PlayersStatus[]
  mapUrl: string
  tags: string
  thumbUrl: string
}

export interface PlayersStatus {
  name: string
  score: number
  time: number
}

export interface SrvMinimalInfo {
  title: string
  map: string
  players: string
  connect: string
  game: string
}

interface SingleServerError {
  errorType: string | null | undefined
  message: string | null | undefined
}

export interface SingleServerResponse {
  serverData?: SingleServer
  errors: SingleServerError[] | undefined
}

export interface ListResponse {
  servers: SrvMinimalInfo[]
}
