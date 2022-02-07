import { __prod__ } from '../../../utils/constants'
import { EmbedFieldData, MessageEmbed } from 'discord.js'
import { ICommand } from 'wokcommands'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import { codeBlock } from '@discordjs/builders'
import { C_WARNING } from '../../../config/colors'
import { emberdDivider } from '../../../utils/discord/embedUtils'

export default {
  category: 'Admin Panel',
  description: 'Display all servers',
  permissions: ['ADMINISTRATOR'],
  slash: true,
  testOnly: !__prod__,

  callback: async ({ guild, instance }) => {
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

    embed.setTitle('ADMIN PANEL - SERVERS').setColor(C_WARNING)

    const serversFields: EmbedFieldData[] = []

    servers.forEach((server, i, arr) => {
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
        portField
      ]

      if (i === 0) {
        serversFields.push(emberdDivider)
      }

      // serversFields.push(...fields)

      if (i === arr.length - 1) {
        serversFields.push(...fields)
      } else {
        serversFields.push(...fields, emberdDivider)
      }
    })

    embed.setFields(serversFields)

    return embed
  }
} as ICommand
