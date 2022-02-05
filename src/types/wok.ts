import DiscordJS from 'discord.js'

export interface WOKProps {
  client: DiscordJS.Client<boolean>
  dir: string
  messagesDir: string
  featuresDir: string
  mongoUri: string
  owner?: string
}
