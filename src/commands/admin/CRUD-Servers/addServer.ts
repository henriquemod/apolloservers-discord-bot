import * as DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import { __max_servers_allowed__, __prod__ } from '../../../utils/constants'
import { isValveProtocol } from '../../../utils/protocols'
import { domainValidation, portValidation } from '../../../utils/validations'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Add a server to your servers list',
  permissions: ['ADMINISTRATOR'],
  minArgs: 4,
  maxArgs: 5,
  expectedArgs: '<name> <host> <port> <type> <description>',
  slash: true,
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
      name: 'name',
      description: 'Give a name to your server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name: 'host',
      description: 'Domain or IP address from your server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name: 'port',
      description: 'port that the server is running',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name: 'type',
      description: 'server type',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    },
    {
      name: 'description',
      description:
        'The info you want to display when people request the status',
      required: false,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ guild, interaction, instance }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }

    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }
    const servers = find.servers as Server[]

    if (servers.length >= __max_servers_allowed__) {
      return instance.messageHandler.get(guild, 'MAX_SERVERS_REACHED', {
        MAX: __max_servers_allowed__
      })
    }

    const serverName = interaction.options.getString('name')
    const serverHost = interaction.options.getString('host')
    const serverPort = interaction.options.getString('port')
    const serverType = interaction.options.getString('type')
    const description = interaction.options.getString('description')

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!serverName || !serverHost || !serverPort || !serverType) {
      return instance.messageHandler.get(guild, 'INVALID_VALUES')
    }

    if (!serverName) {
      return instance.messageHandler.get(guild, 'INVALID_SERVER_NAME')
    }

    if (!serverHost || !domainValidation(serverHost)) {
      return instance.messageHandler.get(guild, 'INVALID_SERVER_HOST')
    }

    if (!serverPort || !portValidation(serverPort)) {
      return instance.messageHandler.get(guild, 'INVALID_SERVER_PORT')
    }

    if (!serverType || !isValveProtocol(serverType)) {
      return instance.messageHandler.get(guild, 'INVALID_SERVER_TYPE')
    }

    const length = servers.length === 0 ? 0 : servers.length - 1
    const serverid = servers[length]
      ? servers[length].key + 1
      : servers.length + 1

    const server = {
      key: serverid,
      name: serverName,
      host: serverHost,
      port: parseInt(serverPort),
      type: serverType,
      description
    }

    try {
      await guildServersSchema.findByIdAndUpdate(
        { _id: guild.id },
        {
          $push: {
            servers: server
          }
        },
        {
          upsert: true
        }
      )
      return instance.messageHandler.get(guild, 'SERVER_ADD_SUCCESS', {
        SERVER_NAME: server.name
      })
    } catch (error) {
      return instance.messageHandler.get(guild, 'ERROR_ADD_SERVER')
    }
  }
} as ICommand
