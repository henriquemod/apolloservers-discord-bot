import * as DJS from 'discord.js'
import * as cron from 'node-cron'
import { findScheduleServerId } from '../../../utils/queries/findScheduleById'
import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import { __prod__, __pwencription__ } from '../../../utils/constants'
import EncryptorDecryptor from '../../../utils/encryption'
import { findServerByKey } from '../../../utils/queries/findServerByKey'
import { updateServerStatus } from '../../../utils/status/updateServerStatus'
import { addSchedule } from '../../../utils/queries/addSchedule'
import { isValidTextChannel } from '../../../utils/discord/validations'

const log = log4jConfig(['app', 'out']).getLogger('APP')
const encryption = new EncryptorDecryptor()

export default {
  category: 'Admin Panel',
  description: 'Add a schedule on a server to it be refreshed periodically',
  permissions: ['ADMINISTRATOR'],
  minArgs: 2,
  maxArgs: 2,
  expectedArgs: '<id> <channel>',
  slash: 'both',
  testOnly: !__prod__,

  // init: async () => {
  //   const test = await getAllSchedules()
  //   console.log(test)
  // },

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
    },
    {
      name: 'channel',
      description: 'Channel where the schedule will be posted',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.CHANNEL
    }
  ],

  callback: async ({ guild, interaction, message, args, instance }) => {
    // SECTION - Check if command is executed in a guild and collects server ID
    if (!guild) {
      return 'Please use this command within a server'
    }
    const targetChannel = message
      ? args[1]
      : interaction.options.getString('channel')
    const validChannel = await isValidTextChannel({
      guild,
      channel: targetChannel
    })

    if (!validChannel) {
      return 'Please provide a valid channel'
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
      const apiKey = encryption.decryptString(
        find.apiKey,
        __pwencription__ ?? ''
      )
      const schedule = await findScheduleServerId({
        guildid: guild.id,
        serverid: server.id
      })

      // If schedule is not found, add it and load it
      if (!schedule && validChannel) {
        const testMessage = new DJS.MessageEmbed()
          .setTitle('loading...')
          .setDescription('loading...')

        const fixedMessage = await validChannel.send({
          embeds: [testMessage],
          content: 'Please wait...'
        })
        await updateServerStatus({
          guild,
          server: server,
          apikey: apiKey,
          instance,
          // embed: testMessage,
          message: fixedMessage,
          channelid: validChannel.id
        })

        await addSchedule({
          guildid: guild.id,
          serverid: server.id,
          messageid: fixedMessage.id,
          channelid: validChannel.id
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        cron.schedule('*/20 * * * * *', async () => {
          await updateServerStatus({
            guild,
            server,
            apikey: apiKey,
            instance,
            // embed: testMessage,
            message: fixedMessage,
            channelid: validChannel.id
          })
        })
      } else {
        return `This server is already scheduled in <#${validChannel.id}>`
      }
    } else {
      return 'Server not found'
    }
  }
} as ICommand
