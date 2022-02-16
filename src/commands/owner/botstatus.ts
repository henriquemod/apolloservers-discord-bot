import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../config/log4jConfig'
import { __prod__ } from '../../utils'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Configuration',
  description: 'Set an status for Apollo Servers Bot',
  slash: true,
  testOnly: !__prod__,
  minArgs: 1,
  expectedArgs: '<status>',
  ownerOnly: true,

  error: ({ error, command, message, info }) => {
    log.error(APP_COMMAND_ERROR, {
      error,
      command,
      message,
      info
    })
  },

  callback: async ({ client, text }) => {
    client.user?.setPresence({
      status: 'online',
      activities: [
        {
          name: text
        }
      ]
    })

    return 'Status updated'
  }
} as ICommand
