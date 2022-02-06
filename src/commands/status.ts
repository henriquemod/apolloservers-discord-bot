import {
  EmbedFieldData,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  ReplyMessageOptions
} from 'discord.js'
import { ICommand } from 'wokcommands'
import { C_DANGER, C_SUCCESS } from '../config/colors'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { __prod__, __pwencription__ } from '../utils/constants'
import { makeEmdedOptions, makeOffileEmbend } from '../utils/discord/embedUtils'
import EncryptorDecryptor from '../utils/encryption'
import { serverInfoRequest } from '../utils/requests/serverInfoRequest'
import { sanitizeResponse } from '../utils/sanitizeResponse'
import { createGroups } from '../utils/splitGroups'
import { codeBlock } from '@discordjs/builders'

const encryption = new EncryptorDecryptor()

export default {
  category: 'Servers',
  description: 'Show a server info',
  slash: 'both',
  testOnly: !__prod__,

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

    const find = await guildServersSchema.findById({ _id: guild.id })

    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    } else {
      const servers = find.servers as ServerProps[]

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
              await Promise.all([message.reply(errormsg), botMessage.delete()])
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
            const data = serverInfo?.serverData
            embed.setFields([
              {
                name: 'Slots',
                value: codeBlock(data.slots),
                inline: true
              },
              {
                name: 'Connect',
                value: codeBlock(data.connect),
                inline: true
              },
              {
                name: 'Tags',
                value: codeBlock(data.tags)
              }
            ])
            if (data.players.length > 0) {
              let nameField = ''
              let scoreField = ''
              let timeField = ''
              data.players.forEach((player) => {
                const timeFormatted = new Date(player.time * 1000)
                  .toISOString()
                  .substring(11, 19)

                if (player.score >= 0) {
                  nameField += `${player.name}\n`
                  scoreField += `${player.score}\n`
                  timeField += `${timeFormatted}\n`
                }
              })
              const namesField: EmbedFieldData = {
                name: 'Players',
                value: codeBlock(nameField),
                inline: true
              }
              const scoresField: EmbedFieldData = {
                name: 'Score',
                value: codeBlock(scoreField),
                inline: true
              }
              const timesField: EmbedFieldData = {
                name: 'Time',
                value: codeBlock(timeField),
                inline: true
              }
              embed.addFields([namesField, scoresField, timesField])
            }
            embed
              .setTitle(data.title)
              .setAuthor({
                name: 'Apollo Servers',
                url: 'https://github.com/henriquemod'
              })
              .setDescription(codeBlock(data.desc))
              .setColor(C_SUCCESS)
            if (data.mapUrl.length > 1) {
              embed.setImage(data.mapUrl)
            }
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
                  value: error.message
                } as EmbedFieldData)
            )

            const replymsgn = makeEmdedOptions({
              embed: makeOffileEmbend(fields)
            })

            if (message) {
              await Promise.all([message.reply(replymsgn), botMessage.delete()])
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
              botMessage.delete()
            ])
          } else {
            await statusInt.editReply(makeEmdedOptions({ embed }))
          }
        })
      }
    }
  }
} as ICommand
