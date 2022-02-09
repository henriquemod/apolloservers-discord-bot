import { codeBlock } from '@discordjs/builders'
import {
  EmbedFieldData,
  Message,
  MessageEmbed,
  MessageReaction,
  TextChannel,
  User
} from 'discord.js'
import { APP_COMMAND_ERROR, logInit } from '../../../config/log4jConfig'
import { ICommand } from 'wokcommands'
import { C_WARNING } from '../../../config/colors'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import { __prod__ } from '../../../utils/constants'
import { emberdDivider } from '../../../utils/discord/embedUtils'
import { createEmbedsGroups } from '../../../utils/splitGroups'

const log = logInit(['app', 'out']).getLogger('APP')
const LIMITER = 3

export default {
  category: 'Admin Panel',
  description: 'Display all servers',
  permissions: ['ADMINISTRATOR'],
  slash: false,
  testOnly: !__prod__,

  error: ({ error, command, message, info }) => {
    log.error(APP_COMMAND_ERROR, {
      error,
      command,
      message,
      info
    })
  },

  callback: async ({ message, channel, guild, instance }) => {
    const authorid = message.author.id
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

    const botMessage = await channel.send({
      embeds: [embed]
    })

    const groupedServers = createEmbedsGroups(serversFields, LIMITER)

    await buildEmbendBlock(
      embed,
      groupedServers,
      index,
      groupedServers.length,
      channel,
      authorid,
      botMessage,
      message
    )
  }
} as ICommand

const updateMessage = async (
  msgn: Message,
  embed: MessageEmbed,
  channel: TextChannel
): Promise<Message> => {
  const result = await Promise.all([
    msgn.delete(),
    await channel.send({
      embeds: [embed]
    })
  ])
  return result[1]
}

const buildReactions = async (
  msgn: Message,
  fist: boolean,
  last: boolean
): Promise<void> => {
  try {
    if (!fist) {
      await msgn.react('⏮')
      await msgn.react('◀')
    }
    if (!last) {
      await msgn.react('▶')
      await msgn.react('⏭')
    }
    await msgn.react('🚪')
  } catch (error) {
    console.error('One of the emojis failed to react:', error)
  }
}

const buildEmbendBlock = async (
  embed: MessageEmbed,
  groupedServers: EmbedFieldData[][][],
  index: number,
  size: number,
  channel: TextChannel,
  authorid: string,
  msgn: Message,
  authorMessage: Message
): Promise<boolean> => {
  embed.setFields(...groupedServers[index])
  embed.setFooter({ text: `Page ${index + 1} of ${size}` })

  msgn = await updateMessage(msgn, embed, channel)
  const fist = index === 0
  const last = index === size - 1
  await buildReactions(msgn, fist, last)

  const filter = (_m: MessageReaction, user: User): boolean => {
    return user.id === authorid
  }

  const collector = msgn.createReactionCollector({
    filter,
    time: 1000 * 15
  })

  let haveInteraction = false
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  collector.on('collect', async (reaction) => {
    if (reaction.emoji.name === '⏮') {
      embed.setFields(...groupedServers[0])
      index = 0
      haveInteraction = true
    }
    if (reaction.emoji.name === '◀') {
      embed.setFields(...groupedServers[index--])
      haveInteraction = true
    }
    if (reaction.emoji.name === '▶') {
      embed.setFields(...groupedServers[index++])
      haveInteraction = true
    }
    if (reaction.emoji.name === '⏭') {
      embed.setFields(...groupedServers[groupedServers.length - 1])
      index = groupedServers.length - 1
      haveInteraction = true
    }
    if (reaction.emoji.name === '🚪') {
      await Promise.all([msgn.delete(), authorMessage.delete()])
      return
    }
    msgn = await updateMessage(msgn, embed, channel)
    await buildEmbendBlock(
      embed,
      groupedServers,
      index,
      size,
      channel,
      authorid,
      msgn,
      authorMessage
    )
  })

  collector.on('end', (collected) => {
    if (collected.size === 0) {
      return false
    }
  })

  return haveInteraction
}
