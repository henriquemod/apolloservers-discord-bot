import {
  EmbedFieldData,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  ReplyMessageOptions
} from 'discord.js'
import { codeBlock } from '@discordjs/builders'
import { ICommand } from 'wokcommands'
import { C_DANGER } from '../config/colors'
import guildServersSchema, { Server } from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { __prod__, __pwencription__ } from '../utils/constants'
import {
  makeEmdedOptions,
  makeOffileEmbend,
  fullEmberdDivider
} from '../utils/discord/embedUtils'
import EncryptorDecryptor from '../utils/encryption'
import { serverInfoRequest } from '../utils/requests/serverInfoRequest'
import { sanitizeResponse } from '../utils/sanitizeResponse'
import { createGroups } from '../utils/splitGroups'
import { statusSkeleton } from '../utils/skeleton/statusSkeleton'
import { successEmbed } from '../utils/discord/embedStatus'
import log4jConfig, { APP_COMMAND_ERROR } from '../config/log4jConfig'

const log = log4jConfig(['app', 'out']).getLogger('APP')
const encryption = new EncryptorDecryptor()

export default {
  category: 'Servers',
  description: 'Show a server info',
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

  callback: async ({
    interaction: statusInt,
    channel,
    guild,
    instance,
    message
  }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }

    let botMessage: Message
    let botMessageStatus: Message

    const find = await guildServersSchema.findById({ _id: guild.id })

    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    } else {
      const servers = find.servers as Server[]

      if (!servers || servers.length === 0) {
        return instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
      } else {
        const serverGroups = createGroups(servers, 5)
        const rows = serverGroups.map((group) => {
          const row = new MessageActionRow()
          group.forEach((server) => {
            row.addComponents(
              new MessageButton()
                .setCustomId(server.id)
                .setEmoji('🎮')
                .setLabel(server.name)
                .setStyle('SECONDARY')
            )
          })
          return row
        })

        /**
         * Send to user the list of servers
         */
        const obj: ReplyMessageOptions = {
          content: instance.messageHandler.get(guild, 'SELECT_SERVER'),
          components: rows.map((row) => row)
        }
        if (message) {
          botMessage = await message.reply(obj)
        } else {
          await statusInt.reply({
            ...obj,
            ephemeral: true
          })
        }

        const filter = (btnInt: MessageComponentInteraction): boolean => {
          const userId = message ? message.author.id : statusInt.user.id
          return btnInt.user.id === userId
        }

        const collector = channel.createMessageComponentCollector({
          filter,
          max: 1,
          time: 1000 * 7
        })

        collector.on('end', async (collection) => {
          let id
          collection.forEach((click) => {
            id = click.customId
          })

          const query = await guildServersSchema.findOne(
            {
              _id: guild.id
            },
            { servers: { $elemMatch: { _id: id } } }
          )

          /**
           * NOTE - Check if there is no server added
           *        shoudnt be a problem since if bot get here
           *        means that already have some server added,
           *        but just to be sure
           */
          if (!query) {
            const errormsg = makeEmdedOptions({
              content: instance.messageHandler.get(
                guild,
                'ERROR_NONE_GAMESERVER'
              )
            })

            if (message) {
              await message.reply(errormsg)
            } else {
              await statusInt.editReply(errormsg)
            }

            return
          }

          if (query.servers.length === 0) {
            const errormsg = makeEmdedOptions({
              content: instance.messageHandler.get(guild, 'NO_SERVER_SELECTED')
            })

            if (message) {
              await Promise.all([message.reply(errormsg), botMessage.delete()])
            } else {
              await statusInt.editReply(errormsg)
            }

            return
          }

          const serverSelected = query.servers[0] as ServerProps

          if (!serverSelected) return

          const apiKey = encryption.decryptString(
            find.apiKey,
            __pwencription__ ?? ''
          )

          if (message) {
            const msgn = await Promise.all([
              message.channel.send(
                makeEmdedOptions({ embed: statusSkeleton() })
              ),
              botMessage.delete()
            ])
            botMessageStatus = msgn[0]
          } else {
            await statusInt.editReply(
              makeEmdedOptions({ embed: statusSkeleton() })
            )
          }

          const request = await serverInfoRequest({
            host: serverSelected.host,
            port: serverSelected.port,
            type: serverSelected.type,
            apikey: apiKey
          })

          if (!request) {
            const errormsg = makeEmdedOptions({
              content: instance.messageHandler.get(guild, 'DEFAULT_ERROR')
            })

            if (message) {
              await Promise.all([
                message.reply(errormsg),
                botMessageStatus.delete()
              ])
            } else {
              await statusInt.editReply(errormsg)
            }
            return
          }

          const embed = new MessageEmbed()

          const serverInfo = sanitizeResponse(
            request.getServerInfo,
            serverSelected.type,
            serverSelected.description ?? 'The best server is the world'
          )

          /**
           * NOTE - If serverData is present, it means that the server is online
           *       and data is sanitized and ready to be sent to discord
           */
          if (serverInfo?.serverData) {
            successEmbed({ data: serverInfo?.serverData, embed })
          } else if (serverInfo?.errors) {
            /**
             * NOTE - If serverData is not present, it means that the server is possibly offline
             *        in this case, we want make sure if there is not an error coming from the api
             *       and if there is an error, we want to show as embed to discord server
             */
            const fields = serverInfo.errors.map(
              (error) =>
                ({
                  name: error.errorType,
                  value: codeBlock(error.message ?? 'Unknown error')
                } as EmbedFieldData)
            )

            fields.unshift(fullEmberdDivider)

            const replymsgn = makeEmdedOptions({
              embed: makeOffileEmbend(fields)
            })

            if (message) {
              await Promise.all([
                message.reply(replymsgn),
                botMessageStatus.delete()
              ])
            } else {
              await statusInt.editReply(replymsgn)
            }

            return
          } else {
            /**
             * NOTE - If neither serverData nor errors are present,
             *        it means that the server is possibly offline
             *        or missconfigured, in this case, we just want
             *        to show a default offline embed to discord server
             */
            embed
              .setTitle('Offline')
              .setDescription('Offline')
              .setColor(C_DANGER)
          }
          if (message) {
            await Promise.all([
              message.channel.send(makeEmdedOptions({ embed })),
              botMessageStatus.delete()
            ])
          } else {
            await statusInt.editReply(makeEmdedOptions({ embed }))
          }
        })
      }
    }
  }
} as ICommand
