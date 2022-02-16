import * as DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema from '../../../models/guild-servers'
import { __prod__ } from '../../../utils'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Set the bot timezone',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  expectedArgs: '<timezone>',
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
      name: 'timezone',
      description: 'Inform desired timezone',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ guild, interaction, instance }) => {
    if (!guild) {
      return interaction.options.getString('GUILD_COMMAND_ONLY')
    }
    const timezone = interaction.options.getString('timezone')

    if (!timezone) {
      return instance.messageHandler.get(guild, 'API_NEEDED')
    }

    try {
      await guildServersSchema.findByIdAndUpdate(
        { _id: guild.id },
        {
          timezone
        },
        {
          upsert: true
        }
      )
      return instance.messageHandler.get(guild, 'TIMEZONE_UPDATED', {
        TIMEZONE: timezone
      })
    } catch (error) {
      return instance.messageHandler.get(guild, 'DEFAULT_ERROR')
    }
  }
} as ICommand
