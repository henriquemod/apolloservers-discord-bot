import * as DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import {
  findServerByKey,
  findScheduleServerId,
  deleteScheduleByServerId,
  __prod__
} from '../../../utils'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Remove a schedule refresh from a server',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  maxArgs: 1,
  expectedArgs: '<id>',
  slash: 'both',
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
      name: 'id',
      description: 'ID of the server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ guild, interaction, message, args, instance }) => {
    // SECTION - Check if command is executed in a guild and collects server ID
    if (!guild) {
      return 'Please use this command within a server'
    }
    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }
    const servers = find.servers as Server[]
    if (servers.length === 0) {
      return instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
    }
    const serverId = message ? args[0] : interaction.options.getString('id')
    if (!serverId) {
      return 'Please provide a server id'
    }
    // SECTION - end

    const server = await findServerByKey({ guild, serverKey: serverId })

    // Servers has to exist in order to add a schedule
    if (server) {
      const schedule = await findScheduleServerId({
        guildid: guild.id,
        serverid: server.id
      })

      // If schedule is not found, add it and load it
      if (!schedule) {
        return 'There is no schedule for this server'
      } else {
        const channel = await guild.channels.fetch(schedule.channelid)
        if (channel && channel instanceof DJS.TextChannel) {
          message = await channel.messages.fetch(schedule.messageid)
          if (message) {
            await message.delete()
          }
        }
        const deleteSchedule = await deleteScheduleByServerId({
          guildid: guild.id,
          serverid: server.id
        })
        if (deleteSchedule) {
          return 'Schedule removed'
        }
      }
    } else {
      return 'Server not found'
    }
  }
} as ICommand
