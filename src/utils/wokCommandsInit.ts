import DiscordJS from 'discord.js'
import WOKCommands from 'wokcommands'

export const initializeWOK = (
  client: DiscordJS.Client<boolean>,
  dir: string
): WOKCommands => {
  return new WOKCommands(client, {
    commandsDir: dir,
    typeScript: true,
    testServers: ['891477811481677834']
  })
}
