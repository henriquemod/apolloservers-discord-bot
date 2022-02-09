import { ICommand } from 'wokcommands'
import { APP_COMMAND_ERROR, logInit } from '../../config/log4jConfig'
import { __prod__ } from '../../utils/constants'

const log = logInit(['app', 'out']).getLogger('APP')

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
