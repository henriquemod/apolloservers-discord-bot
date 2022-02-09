import { codeBlock } from '@discordjs/builders'
import * as DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../../models/guild-servers'
import { __prod__ } from '../../../../utils/constants'
import { portValidation } from '../../../../utils/validations'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Edit a server port',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  testOnly: !__prod__,
  minArgs: 2,
  expectedArgs: '<id> <port>',

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
      name: 'port',
      description: 'Informa the new port of the server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ message, interaction, guild, instance, args }) => {
    if (!guild) {
      return codeBlock(instance.messageHandler.get(guild, 'ONLY_IN_SERVER'))
    }
    let portByArg = ''
    if (message && args.length > 1) {
      portByArg = args[1]
    }
    const serverId = interaction ? interaction.options.getString('id') : args[0]
    const serverPort = interaction
      ? interaction.options.getString('port') ?? ''
      : ''

    const port = interaction ? serverPort : portByArg

    if (!portValidation(port)) {
      return codeBlock(
        instance.messageHandler.get(guild, 'INVALID_PORT', { PORT: port })
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
        { $set: { 'servers.$.port': port } }
      )
    } catch (error) {
      console.log(error)
    }

    return codeBlock(
      instance.messageHandler.get(guild, 'PORT_UPDATED', { PORT: port })
    )
  }
} as ICommand
