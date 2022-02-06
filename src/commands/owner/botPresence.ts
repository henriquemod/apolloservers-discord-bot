import { __prod__ } from '../../utils/constants'
import { ICommand } from 'wokcommands'

export default {
  category: 'Configuration',
  description: 'Shows how many servers Apollo Servers Bot is in',
  slash: 'both',
  testOnly: !__prod__,
  ownerOnly: true,

  callback: async ({ client }) => {
    const { guilds } = client
    return `Im present in ${guilds.cache.size} server(s)`
  }
} as ICommand
