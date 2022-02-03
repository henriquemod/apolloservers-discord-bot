import { __max_servers_allowed__, __prod__ } from '../../utils/constants'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../../models/guild-servers'
import { domainValidation, portValidation } from '../../utils/validations'
import { isValveProtocol } from '../../utils/protocols'
import { ServerProps } from '../../types/server'

export default {
  category: 'Admin Panel',
  description: 'Add a server to your servers list',
  permissions: ['ADMINISTRATOR'],
  minArgs: 4,
  maxArgs: 5,
  expectedArgs: '<name> <host> <port> <type> <description>',
  slash: true,
  testOnly: !__prod__,

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
    const servers = find.servers as ServerProps[]

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

    const server = {
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
