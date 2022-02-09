import { codeBlock } from '@discordjs/builders'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import { APP_COMMAND_ERROR, logInit } from '../../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../../models/guild-servers'
import { __prod__ } from '../../../../utils/constants'

const log = logInit(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Edit a server name',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  testOnly: !__prod__,
  minArgs: 2,
  expectedArgs: '<id> <name>',

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
      name: 'name',
      description: 'Informa the new name of the server',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ interaction, guild, instance, args }) => {
    if (!guild) {
      return codeBlock(instance.messageHandler.get(guild, 'ONLY_IN_SERVER'))
    }
    let nameByArgs = ''
    if (args.length > 1) {
      args.forEach((arg, i) => {
        if (i !== 0) {
          nameByArgs += `${i === 1 ? '' : ' '}${arg}`
        }
      })
    }
    const serverId = interaction ? interaction.options.getString('id') : args[0]
    const serverName = interaction
      ? interaction.options.getString('name') ?? ''
      : ''

    const name = interaction ? serverName : nameByArgs

    if (name.length < 3 || name.length > 20) {
      return codeBlock(
        instance.messageHandler.get(guild, 'NAME_LENGTH', {
          MIN: 3,
          MAX: 20
        })
      )
    }

    if (!name) {
      return codeBlock(
        instance.messageHandler.get(guild, 'INVALID_SERVER_NAME')
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
        { $set: { 'servers.$.name': name } }
      )
    } catch (error) {
      console.log(error)
    }

    return codeBlock(
      instance.messageHandler.get(guild, 'SERVER_NAME_UPDATED', {
        NAME: name
      })
    )
  }
} as ICommand
