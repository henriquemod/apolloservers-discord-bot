import * as R from 'ramda'
import { ICommand } from 'wokcommands'
import { appContext } from '../.'
import log4jConfig, { APP_COMMAND_ERROR } from '../config/log4jConfig'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { MessageController } from '../controllers/messages-controller'
import {
  __prod__,
  errorEmbed,
  REmbedProps,
  successEmbed,
  EncryptorDecryptor,
  multiplesMinimalServerRequest
} from '../utils'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Servers',
  description: 'Server list resumed',
  slash: 'both',
  testOnly: !__prod__,

  error: ({ error, command, message, info }) => {
    log.error(APP_COMMAND_ERROR, {
      error,
      command,
      message,
      info
    })
  },

  callback: async ({ message, channel, guild, instance, interaction }) => {
    const msgnController = new MessageController(message, interaction)
    interaction && (await interaction.reply('Please wait...'))
    const authorid = interaction ? interaction.user.id : message.author.id
    if (!guild) {
      return 'Please use this command within a server'
    }

    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }

    const servers = find.servers as ServerProps[]
    if (!servers || servers.length === 0) {
      return instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
    }

    // Guild ID were fount but admin didnt added any server
    const encryption = new EncryptorDecryptor()
    const apiKey = encryption.decryptString(find.apiKey, appContext.masterkey)
    const buildList = servers.map((server) => ({
      host: `"${server.host}"`,
      port: server.port,
      type: `"${server.type}"`
    }))

    const request = await multiplesMinimalServerRequest({
      apikey: apiKey,
      servers: buildList,
      instance,
      guild
    })

    if (!request) {
      return instance.messageHandler.get(guild, 'DEFAULT_ERROR')
    }

    const result = request.getMultiplesServerInfo
    const obj: REmbedProps = {
      authorid: authorid,
      guild,
      instance,
      msgnController,
      channel,
      result
    }

    const fn = R.cond([
      [(x) => !!x.result?.errors, errorEmbed],
      [(x) => !!x.result?.response, successEmbed]
    ])

    await fn(obj)
  }
} as ICommand
