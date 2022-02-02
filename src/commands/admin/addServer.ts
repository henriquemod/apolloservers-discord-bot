import { __prod__ } from '../../utils/constants'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../../models/guild-servers'
import { domainValidation, portValidation } from '../../utils/validations'
import { isValveProtocol } from '../../utils/protocols'

export default {
  category: 'Admin Panel',
  description: 'Add a server to your servers list',
  permissions: ['ADMINISTRATOR'],
  minArgs: 4,
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

  callback: async ({ guild, interaction }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }
    const serverName = interaction.options.getString('name')
    const serverHost = interaction.options.getString('host')
    const serverPort = interaction.options.getString('port')
    const serverType = interaction.options.getString('type')
    const description = interaction.options.getString('description')

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!serverName || !serverHost || !serverPort || !serverType) {
      return 'Please provide correct values'
    }

    if (!serverName) {
      return 'Please inform the name you want to identify this server'
    }

    if (!serverHost || !domainValidation(serverHost)) {
      return 'Please inform your server host, that has to be an domain or a IP address'
    }

    if (!serverPort || !portValidation(serverPort)) {
      return 'Please inform the port a correct value for server port'
    }

    if (!serverType || !isValveProtocol(serverType)) {
      return 'Please inform your server type, get list of types in https://github.com/gamedig/node-gamedig#games-list, please keep in mind only valve protocols are available by ApolloServers at this moment'
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
      return `Server ${server.name} was successfully added`
    } catch (error) {
      return 'An errour occoured, please verify if parametes were correct'
    }
  }
} as ICommand
