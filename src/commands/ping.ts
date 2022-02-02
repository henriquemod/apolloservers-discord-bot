import { __prod__ } from '../utils/constants'
import { ICommand } from 'wokcommands'

export default {
  category: 'testing',
  description: 'replies with pon',
  slash: 'both',
  testOnly: !__prod__,

  callback: async ({ guild, instance }) => {
    return instance.messageHandler.get(guild, 'INVALID_SERVER_PORT')
  }
} as ICommand
