import * as DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema from '../../../models/guild-servers'
import { __prod__ } from '../../../utils'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Set the bot locale',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  expectedArgs: '<locale>',
  slash: true,
  testOnly: !__prod__,

  error: ({ error, command, message, info }) => {
    log.error(APP_COMMAND_ERROR, {
      error,
      command,
      message,
      info
    })
  },

  options: [
    {
      name: 'locale',
      description: 'Inform desired locale',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ guild, interaction, instance }) => {
    if (!guild) {
      return interaction.options.getString('GUILD_COMMAND_ONLY')
    }
    const locale = interaction.options.getString('locale')

    if (!locale) {
      return instance.messageHandler.get(guild, 'LOCALE_NEEDED')
    }

    try {
      await guildServersSchema.findByIdAndUpdate(
        { _id: guild.id },
        {
          locale
        },
        {
          upsert: true
        }
      )
      return instance.messageHandler.get(guild, 'LOCALE_UPDATED', {
        LOCALE: locale
      })
    } catch (error) {
      return instance.messageHandler.get(guild, 'DEFAULT_ERROR')
    }
  }
} as ICommand
