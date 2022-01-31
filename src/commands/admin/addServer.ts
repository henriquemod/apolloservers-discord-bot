/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { __prod__ } from '../../utils/constants'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../../models/guild-servers'

export default {
  category: 'Admin Panel',
  description: 'Add a server to your servers list',
  permissions: ['ADMINISTRATOR'],
  minArgs: 4,
  expectedArgs: '<name> <host> <port> <type>',
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

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!serverName || !serverHost || !serverPort || !serverType) {
      return 'Please provide correct values'
    }

    if (!serverName) {
      return 'Please inform the name you want to identify this server'
    }

    if (!serverHost) {
      return 'Please inform your server host, that has to be an domain or a IP address'
    }

    if (!serverPort) {
      return 'Please inform the port your server is running'
    }

    if (!serverType) {
      return 'Please inform your server type, get list of types in https://github.com/gamedig/node-gamedig#readme, please keep in mind only valve protocols are available my ApolloServers at this moment'
    }

    const server = {
      name: serverName,
      host: serverHost,
      port: parseInt(serverPort),
      type: serverType
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
