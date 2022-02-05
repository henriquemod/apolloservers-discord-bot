import { WOKProps } from '../types/wok'
import WOKCommands from 'wokcommands'

export const initializeWOK = ({
  client,
  dir,
  messagesDir,
  featuresDir,
  mongoUri,
  owner
}: WOKProps): WOKCommands => {
  return new WOKCommands(client, {
    commandsDir: dir,
    messagesPath: messagesDir,
    featuresDir,
    testServers: ['939523636535124018'],
    mongoUri,
    botOwners: owner ?? '',
    defaultLanguage: 'english'
  })
}
