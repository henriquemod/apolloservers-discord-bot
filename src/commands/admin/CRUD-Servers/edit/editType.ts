import { codeBlock } from '@discordjs/builders'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import { APP_COMMAND_ERROR, logInit } from '../../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../../models/guild-servers'
import { __prod__ } from '../../../../utils/constants'
import { isValveProtocol } from '../../../../utils/protocols'

const log = logInit(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Edit a server type',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  testOnly: !__prod__,
  minArgs: 2,
  expectedArgs: '<id> <type>',

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
      description: 'Inform the ID of the server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name: 'type',
      description: 'Informa the new type of the server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ message, interaction, guild, instance, args }) => {
    if (!guild) {
      return codeBlock(instance.messageHandler.get(guild, 'ONLY_IN_SERVER'))
    }
    let typeByArg = ''
    if (message && args.length > 1) {
      typeByArg = args[1]
    }
    const serverId = interaction ? interaction.options.getString('id') : args[0]
    const serverType = interaction
      ? interaction.options.getString('type') ?? ''
      : ''

    const type = interaction ? serverType : typeByArg

    if (!isValveProtocol(type)) {
      return codeBlock(
        instance.messageHandler.get(guild, 'INVALID_TYPE', { TYPE: type })
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
        { $set: { 'servers.$.type': type } }
      )
    } catch (error) {
      console.log(error)
    }

    return codeBlock(
      instance.messageHandler.get(guild, 'TYPE_UPDATED', { TYPE: type })
    )
  }
} as ICommand
