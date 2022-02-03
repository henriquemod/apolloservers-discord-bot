interface SingleServer {
  title: string
  desc: string
  slots: string
  connect: string
  players: string
  mapUrl: string
  tags: string
  thumbUrl: string
}

interface SingleServerError {
  errorType: string | null | undefined
  message: string | null | undefined
}

export interface SingleServerResponse {
  serverData?: SingleServer
  errors: SingleServerError[] | undefined
}
