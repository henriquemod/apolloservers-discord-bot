import * as DJS from 'discord.js'
import { MessageController } from '../../../controllers/messages-controller'
import { ICommand } from 'wokcommands'
import { appContext } from '../../..'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import {
  __prod__,
  findScheduleServerId,
  findServerByKey,
  EncryptorDecryptor,
  UpdateServerProps,
  updateServerStatus
} from '../../../utils'
import { ChannelController } from '../../../controllers/channel-controller'

const { schedule } = appContext
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

    const { messageHandler } = instance

    const msgnController = new MessageController({
      message,
      interaction,
      args: {
        args,
        labels: ['id', 'channel']
      }
    })

    interaction && (await interaction.reply('Please wait...'))

    const targetChannel = msgnController.getArg('channel')
    if (targetChannel === '') {
      return messageHandler.get(guild, 'CHANNEL_NEEDED')
    }

    const chnlController = new ChannelController({
      guild,
      channel: targetChannel
    })

    const validChannel = chnlController.isValidTextChannel()
    if (!validChannel) {
      return messageHandler.get(guild, 'INVALID_CHANNEL')
    }

    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }

    const servers = find.servers as Server[]
    if (servers.length === 0) {
      return messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
    }

    const serverId = message ? args[0] : interaction.options.getString('id')
    if (!serverId) {
      return messageHandler.get(guild, 'PROVIDE_SERVER_ID')
    }
    // SECTION - end

    const server = await findServerByKey({ guild, serverKey: serverId })
    if (server) {
      const apikey = encryption.decryptString(find.apiKey, appContext.masterkey)

      const findSchedule = await findScheduleServerId({
        guildid: guild.id,
        serverid: server.id
      })

      // If schedule is not found, add it and load it
      if (!findSchedule && validChannel) {
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
          await schedule.createCron(statusObj),
          await schedule.addSchedule({
            guildid: guild.id,
            serverid: server.id,
            messageid: fixedMessage.id,
            channelid: validChannel.id
          })
        ])
        await msgnController.replyOrEdit({
          content: messageHandler.get(guild, 'SCHEDULE_CREATED', {
            SERVER: server.name,
            CHANNEL: `<#${validChannel.id}>`
          })
        })
      } else {
        return messageHandler.get(guild, 'SERVER_ALREADY_SCHEDULED', {
          CHANNEL: `<#${validChannel.id}>`
        })
      }
    } else {
      return messageHandler.get(guild, 'SERVER_NOT_FOUND')
    }
  }
} as ICommand
