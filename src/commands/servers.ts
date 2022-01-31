/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { __prod__ } from '../utils/constants'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { EmbedFieldData, MessageEmbed } from 'discord.js'

export default {
  category: 'Servers',
  description: 'Server list resumed',
  slash: 'both',
  testOnly: !__prod__,

  callback: async ({ guild }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }

    const find = await guildServersSchema.findById({ _id: guild.id })
    const servers = find.servers as ServerProps[]

    const embendFields: EmbedFieldData[] = []

    servers.forEach((server) => {
      embendFields.push({
        name: server.name,
        value: `${server.host}:${server.port}`
      })
    })

    const embed = new MessageEmbed()
      .setTitle('Servers List')
      .setFields(embendFields)

    return embed
  }
} as ICommand
