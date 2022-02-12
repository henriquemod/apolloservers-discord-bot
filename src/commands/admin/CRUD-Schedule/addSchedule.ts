import * as DJS from 'discord.js'
import * as cron from 'node-cron'
import { ICommand } from 'wokcommands'
import { appContext } from '../../..'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import { __prod__ } from '../../../utils/constants'
import { isValidTextChannel } from '../../../utils/discord/validations'
import EncryptorDecryptor from '../../../utils/encryption'
import { addSchedule } from '../../../utils/queries/addSchedule'
import { findScheduleServerId } from '../../../utils/queries/findScheduleById'
import { findServerByKey } from '../../../utils/queries/findServerByKey'
import {
  UpdateServerProps,
  updateServerStatus
} from '../../../utils/status/updateServerStatus'

const log = log4jConfig(['app', 'out']).getLogger('APP')
const encryption = new EncryptorDecryptor()
const createCron = async (server: UpdateServerProps): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  cron.schedule('*/20 * * * * *', async () => {
    await updateServerStatus(server)
  })
}
export default {
  category: 'Admin Panel',
  description: 'Add a schedule on a server to it be refreshed periodically',
  permissions: ['ADMINISTRATOR'],
  minArgs: 2,
  maxArgs: 2,
  expectedArgs: '<id> <channel>',
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
      return instance.messageHandler.get(guild, 'GUILD_COMMAND_ONLY')
    }

    // Validation if is a valid text channel
    const targetChannel = message
      ? args[1]
      : interaction.options.getString('channel')
    const validChannel = await isValidTextChannel({
      guild,
      channel: targetChannel
    })
    if (!validChannel) {
      return instance.messageHandler.get(guild, 'INVALID_CHANNEL')
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
      return instance.messageHandler.get(guild, 'PROVIDE_SERVER_ID')
    }
    // SECTION - end

    const server = await findServerByKey({ guild, serverKey: serverId })

    // Servers has to exist in order to add a schedule
    if (server) {
      const apikey = encryption.decryptString(find.apiKey, appContext.masterkey)
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

        const statusObj: UpdateServerProps = {
          guild,
          server: server,
          apikey,
          instance,
          message: fixedMessage,
          channelid: validChannel.id
        }

        await Promise.all([
          await updateServerStatus(statusObj),
          await createCron(statusObj),
          await addSchedule({
            guildid: guild.id,
            serverid: server.id,
            messageid: fixedMessage.id,
            channelid: validChannel.id
          })
        ])
      } else {
        return instance.messageHandler.get(guild, 'SERVER_ALREADY_SCHEDULED', {
          CHANNEL: `<#${validChannel.id}>`
        })
      }
    } else {
      return instance.messageHandler.get(guild, 'SERVER_NOT_FOUND')
    }
  }
} as ICommand
