import DiscordJS from 'discord.js'
import WOKCommands from 'wokcommands'

export const initializeWOK = (
  client: DiscordJS.Client<boolean>,
  dir: string,
  owner?: string
): WOKCommands => {
  console.log('owner: ', owner)

  return new WOKCommands(client, {
    commandsDir: dir,
    testServers: ['891477811481677834'],
    botOwners: owner ?? ''
  })
}
