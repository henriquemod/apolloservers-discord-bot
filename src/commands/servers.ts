import { __prod__, __pwencription__ } from '../utils/constants'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { EmbedFieldData, MessageEmbed } from 'discord.js'
import { multiplesMinimalServerRequest } from '../utils/requests/serverInfoRequest'
import EncryptorDecryptor from '../utils/encryption'

export default {
  category: 'Servers',
  description: 'Server list resumed',
  slash: 'both',
  testOnly: !__prod__,

  callback: async ({ guild, instance }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }

    const find = await guildServersSchema.findById({ _id: guild.id })

    /**
     * Maybe Bot was added but not configured yet
     * TODO - Give better feedback
     */
    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    } else {
      const servers = find.servers as ServerProps[]

      // Guild ID were fount but admin didnt added any server
      if (!servers || servers.length === 0) {
        return instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
      } else {
        const encryption = new EncryptorDecryptor()
        let apiKey = ''
        if (__pwencription__) {
          apiKey = encryption.decryptString(find.apiKey, __pwencription__)
        }

        const embendFields: EmbedFieldData[] = []

        const buildList = servers.map((server) => ({
          host: `"${server.host}"`,
          port: server.port,
          type: `"${server.type}"`
        }))

        const request = await multiplesMinimalServerRequest({
          apikey: apiKey,
          servers: buildList
        })

        if (!request) {
          return instance.messageHandler.get(guild, 'DEFAULT_ERROR')
        }

        const result = request.getMultiplesServerInfo

        /**
         * TODO - Improve this mess
         */
        if (result) {
          result.forEach((server) => {
            const players = server.response?.raw?.numplayers
              ? server.response?.raw?.numplayers
              : (instance.messageHandler.get(guild, 'NOT_AVAILABLE') as string)
            if (server.response) {
              embendFields.push({
                name: server.response?.name,
                value: `IP: ${server.response?.connect} | Players: ${players}/${server.response?.maxplayers}`
              } as EmbedFieldData)
            }
          })
        }

        const embed = new MessageEmbed()
          .setTitle(instance.messageHandler.get(guild, 'LIST_SERVERS'))
          .setFields(embendFields)

        return embed
      }
    }
  }
} as ICommand
