import { WOKProps } from '../types/wok'
import WOKCommands from 'wokcommands'
import { _botname_, __prod__ } from './constants'

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
    defaultLanguage: 'english',
    delErrMsgCooldown: 3,
    debug: !__prod__
  })
    .setDisplayName(_botname_)
    .setCategorySettings([
      {
        name: 'Admin Panel',
        emoji: '👮‍♂️',
        hidden: true
      },
      {
        name: 'Configuration',
        emoji: '🚧',
        hidden: true
      },
      {
        name: 'Servers',
        emoji: '🎮'
      }
    ])
}
