export interface ServerProps {
  name: string
  host: string
  port: number
  type: string
  id: string
}

export interface SingleServer {
  host: string
  port: number
  type: string
}
