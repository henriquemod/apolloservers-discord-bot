import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../config/log4jConfig'
import { __prod__ } from '../../utils/constants'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Configuration',
  description: 'Shows how many servers Apollo Servers Bot is in',
  slash: 'both',
  testOnly: !__prod__,
  ownerOnly: true,

  error: ({ error, command, message, info }) => {
    log.error(APP_COMMAND_ERROR, {
      error,
      command,
      message,
      info
    })
  },

  callback: async ({ client }) => {
    const { guilds } = client
    return `Im present in ${guilds.cache.size} server(s)`
  }
} as ICommand
