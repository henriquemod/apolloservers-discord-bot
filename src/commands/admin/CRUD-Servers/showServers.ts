import { codeBlock } from '@discordjs/builders'
import {
  CacheType,
  CommandInteraction,
  EmbedFieldData,
  Message,
  MessageEmbed
} from 'discord.js'
import { ICommand } from 'wokcommands'
import { C_WARNING } from '../../../config/colors'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import {
  __prod__,
  embedPaginated,
  emberdDivider,
  createEmbedsGroups
} from '../../../utils'

const log = log4jConfig(['app', 'out']).getLogger('APP')
const LIMITER = 3

export default {
  category: 'Admin Panel',
  description: 'Display all servers',
  permissions: ['ADMINISTRATOR'],
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

  callback: async ({ message, channel, guild, instance, interaction }) => {
    const authorid = interaction ? interaction.user.id : message.author.id
    const index = 0
    if (!guild) {
      return 'Please use this command within a server'
    }

    const find = await guildServersSchema.findById({ _id: guild.id })

    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }
    const servers = find.servers as Server[]
    if (!servers || servers.length === 0) {
      return instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
    }

    const embed = new MessageEmbed()

    embed.setTitle('Admin Panel - Servers').setColor(C_WARNING)

    const serversFields: EmbedFieldData[][] = []

    servers.forEach((server) => {
      const idField: EmbedFieldData = {
        name: 'ID',
        value: codeBlock(server.key.toString()),
        inline: true
      }
      const nameField: EmbedFieldData = {
        name: 'Name',
        value: codeBlock(server.name),
        inline: true
      }
      const typeField: EmbedFieldData = {
        name: 'Type',
        value: codeBlock(server.type),
        inline: true
      }
      const messageField: EmbedFieldData = {
        name: 'Description',
        value: codeBlock(server.description ?? 'No description')
      }
      const hostField: EmbedFieldData = {
        name: 'Host',
        value: codeBlock(server.host),
        inline: true
      }
      const portField: EmbedFieldData = {
        name: 'Port',
        value: codeBlock(server.port.toString()),
        inline: true
      }

      const fields: EmbedFieldData[] = [
        idField,
        nameField,
        typeField,
        messageField,
        hostField,
        portField,
        emberdDivider
      ]

      serversFields.push(fields)
    })

    if (interaction) {
      await interaction.reply('.')
    }
    const botMessage = await channel.send({
      embeds: [embed]
    })

    const groupedServers = createEmbedsGroups(serversFields, LIMITER)

    const msgnObj: Message | CommandInteraction<CacheType> =
      interaction ?? message

    await embedPaginated({
      embed,
      groupedServers,
      index,
      size: groupedServers.length,
      channel,
      authorid,
      msgn: botMessage,
      authorMessage: msgnObj,
      callback: embedPaginated,
      timeout: 30
    })
  }
} as ICommand
