import { MessageEmbed } from 'discord.js'
import { ICommand } from 'wokcommands'
import { C_SUCCESS } from '../config/colors'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { __prod__, __pwencription__ } from '../utils/constants'
import { minimalStatusEmbed } from '../utils/discord/embedStatus'
import EncryptorDecryptor from '../utils/encryption'
import { multiplesMinimalServerRequest } from '../utils/requests/serverInfoRequest'
import { sanitizeListResponse } from '../utils/sanitizeResponse'

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

        if (result?.errors) {
          for (const error of result.errors) {
            if (error.errorType === 'api-error') {
              return instance.messageHandler.get(guild, 'API_KEY_ERROR')
            }
          }
        }

        if (result) {
          const data = sanitizeListResponse(result)
          if (data) {
            const embed = new MessageEmbed()

            data.servers.forEach((server, i, arr) => {
              if (i === arr.length - 1) {
                embed.addFields(minimalStatusEmbed(server))
              } else {
                embed.addFields(minimalStatusEmbed(server, true))
              }
            })

            embed.setColor(C_SUCCESS)
            return embed
          } else {
            return instance.messageHandler.get(guild, 'DEFAULT_ERROR')
          }
        } else {
          return instance.messageHandler.get(guild, 'DEFAULT_ERROR')
        }
      }
    }
  }
} as ICommand
