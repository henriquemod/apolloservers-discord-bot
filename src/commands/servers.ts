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

  callback: async ({ guild }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }

    const find = await guildServersSchema.findById({ _id: guild.id })

    /**
     * Maybe Bot was added but not configured yet
     * TODO - Give better feedback
     */
    if (!find) {
      return 'The administrator from this discord didnt configure me'
    } else {
      const servers = find.servers as ServerProps[]

      // Guild ID were fount but admin didnt added any server
      if (!servers || servers.length === 0) {
        return 'There is no server added in this discord server 😥'
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

        const result = request.getMultiplesServerInfo

        /**
         * TODO - Improve this mess
         */
        if (result) {
          result.forEach((server) => {
            const players = server.response?.raw?.numplayers
              ? server.response?.raw?.numplayers
              : 'Not Available'
            if (server.response) {
              embendFields.push({
                name: server.response?.name,
                value: `IP: ${server.response?.connect} | Players: ${players}/${server.response?.maxplayers}`
              } as EmbedFieldData)
            }
          })
        }

        const embed = new MessageEmbed()
          .setTitle('Servers List')
          .setFields(embendFields)

        return embed
      }
    }
  }
} as ICommand
