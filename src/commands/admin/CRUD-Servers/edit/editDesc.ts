import { __prod__ } from '../../../../utils/constants'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import guildServersSchema, { Server } from '../../../../models/guild-servers'
import { codeBlock } from '@discordjs/builders'

const DESC_MAX_LENGTH = 4095

export default {
  category: 'Admin Panel',
  description: 'Edit a server description',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  testOnly: !__prod__,
  minArgs: 2,
  expectedArgs: '<id> <description>',

  options: [
    {
      name: 'id',
      description: 'Inform the ID of the server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name: 'description',
      description: 'Informa a new description of the server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ message, interaction, guild, instance, args }) => {
    if (!guild) {
      return codeBlock(instance.messageHandler.get(guild, 'ONLY_IN_SERVER'))
    }
    let descByArgs = ''
    if (message && args.length > 1) {
      args.forEach((arg, i) => {
        if (i !== 0) {
          descByArgs += `${i === 1 ? '' : ' '}${arg}`
        }
      })
    }

    const serverId = interaction ? interaction.options.getString('id') : args[0]
    const serverDesc = interaction
      ? interaction.options.getString('description') ?? ''
      : ''

    const description = interaction ? serverDesc : descByArgs

    if (description.length >= DESC_MAX_LENGTH) {
      return codeBlock(
        instance.messageHandler.get(guild, 'DESCRIPTION_LENGTH', {
          MAX: DESC_MAX_LENGTH
        })
      )
    }

    if (!description) {
      return codeBlock(
        instance.messageHandler.get(guild, 'MISSING_PARAMETER', {
          PARAM: '<description>'
        })
      )
    }

    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return codeBlock(
        instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
      )
    }
    const servers = find.servers as Server[]

    if (!servers || servers.length === 0) {
      return codeBlock(
        instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
      )
    }

    const server = servers.find((s) => s.key.toString() === serverId)

    if (!server) {
      return codeBlock(
        instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_FOUND')
      )
    }

    try {
      await guildServersSchema.updateOne(
        { _id: guild.id, 'servers.key': server.key },
        { $set: { 'servers.$.description': description } }
      )
    } catch (error) {
      console.log(error)
    }

    return codeBlock(instance.messageHandler.get(guild, 'SERVER_DESC_UPDATED'))
  }
} as ICommand
