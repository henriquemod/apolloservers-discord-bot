import { codeBlock } from '@discordjs/builders'
import {
  CacheType,
  CommandInteraction,
  EmbedFieldData,
  Message,
  MessageEmbed
} from 'discord.js'
import { ICommand } from 'wokcommands'
import { appContext } from '../.'
import { C_SUCCESS } from '../config/colors'
import log4jConfig, { APP_COMMAND_ERROR } from '../config/log4jConfig'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { __prod__ } from '../utils/constants'
import embedPaginated from '../utils/discord/embedPaginated'
import { minimalStatusEmbed } from '../utils/discord/embedStatus'
import {
  fullEmberdDivider,
  makeEmdedOptions,
  makeOffileEmbend
} from '../utils/discord/embedUtils'
import EncryptorDecryptor from '../utils/encryption'
import { multiplesMinimalServerRequest } from '../utils/requests/serverInfoRequest'
import { sanitizeListResponse } from '../utils/sanitizeResponse'
import { createEmbedsGroups } from '../utils/splitGroups'

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
    const index = 0
    const authorid = interaction ? interaction.user.id : message.author.id
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
        apiKey = encryption.decryptString(find.apiKey, appContext.masterkey)
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

        /**
         * If the request is not valid, return the error response
         */
        if (result?.errors) {
          const errors = result.errors

          const fields = errors.map(
            (error) =>
              ({
                name: error.errorType,
                value: codeBlock(error.message ?? 'Unknown error')
              } as EmbedFieldData)
          )

          fields.unshift(fullEmberdDivider)

          const replymsgn = makeEmdedOptions({
            embed: makeOffileEmbend(instance, guild, fields)
          })

          if (message) {
            await Promise.all([message.reply(replymsgn)])
          } else {
            await interaction.editReply(replymsgn)
          }

          return
        }

        if (result) {
          const data = sanitizeListResponse(result)
          if (data) {
            const embed = new MessageEmbed()
              .setTitle('Servers List')
              .setColor(C_SUCCESS)

            const serversFields = data.servers.map((server, i, arr) => {
              if (i === arr.length - 1) {
                return minimalStatusEmbed(server)
              } else {
                return minimalStatusEmbed(server, true)
              }
            })

            const length = serversFields.length
            let grouped = 0

            if (length <= 4) {
              grouped = 1
            } else if (length <= 8) {
              grouped = 2
            } else if (length <= 12) {
              grouped = 3
            } else if (length <= 16) {
              grouped = 4
            } else {
              grouped = 5
            }

            const groupedServers = createEmbedsGroups(serversFields, grouped)

            if (interaction) {
              await interaction.reply('.')
            }

            const botMessage = await channel.send({
              embeds: [embed]
            })

            const msgnObj: Message | CommandInteraction<CacheType> =
              interaction ?? message

            await embedPaginated({
              embed,
              groupedServers,
              index,
              size: groupedServers.length,
              channel,
              authorid,
              msgn: botMessage,
              authorMessage: msgnObj,
              callback: embedPaginated,
              timeout: 15
            })

            // return embed
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
