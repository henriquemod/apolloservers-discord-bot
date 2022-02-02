import DiscordJS from 'discord.js'
import WOKCommands from 'wokcommands'

// const MESSAGES_DIR = '../messages.json'

export const initializeWOK = (
  client: DiscordJS.Client<boolean>,
  dir: string,
  messagesDir: string,
  mongoUri: string,
  owner?: string
): WOKCommands => {
  return new WOKCommands(client, {
    commandsDir: dir,
    messagesPath: messagesDir,
    testServers: ['891477811481677834'],
    mongoUri,
    botOwners: owner ?? '',
    defaultLanguage: 'english'
  })
}
