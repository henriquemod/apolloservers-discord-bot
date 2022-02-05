import {
  EmbedFieldData,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from 'discord.js'
import { createGroups } from '../utils/splitGroups'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { __prod__, __pwencription__ } from '../utils/constants'
import EncryptorDecryptor from '../utils/encryption'
import { serverInfoRequest } from '../utils/requests/serverInfoRequest'
import { sanitizeResponse } from '../utils/sanitizeResponse'

const encryption = new EncryptorDecryptor()

const DEFAULT_TIMEOUT = 3500

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

        if (message) {
          const botReply = await message.reply({
            content: instance.messageHandler.get(guild, 'SELECT_SERVER'),
            components: rows.map((row) => row)
          })
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          setTimeout(async () => {
            await botReply.delete()
            // await message.delete()
          }, DEFAULT_TIMEOUT)
        } else {
          await statusInt.reply({
            content: instance.messageHandler.get(guild, 'SELECT_SERVER'),
            components: rows.map((row) => row),
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
          time: 1000 * 10
        })

        collector.on('end', async (collection) => {
          let id
          let wasCancel = false
          collection.forEach((click) => {
            if (click.customId !== 'btn_cancel') {
              id = click.customId
            } else {
              wasCancel = true
            }
          })

          if (!wasCancel) {
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
              if (message) {
                await message.reply(
                  instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
                )
                return
              } else {
                await statusInt.editReply({
                  content: instance.messageHandler.get(
                    guild,
                    'ERROR_NONE_GAMESERVER'
                  ),
                  components: []
                })
                return
              }
            }

            if (query.servers.length === 0) {
              if (message) {
                await message.reply(
                  instance.messageHandler.get(guild, 'NO_SERVER_SELECTED')
                )
                return
              } else {
                await statusInt.editReply({
                  content: instance.messageHandler.get(
                    guild,
                    'NO_SERVER_SELECTED'
                  ),
                  components: []
                })
                return
              }
            }

            const apiKey = encryption.decryptString(
              find.apiKey,
              __pwencription__ ?? ''
            )

            const serverSelected = query.servers[0] as ServerProps

            if (!serverSelected) return

            const request = await serverInfoRequest({
              host: serverSelected.host,
              port: serverSelected.port,
              type: serverSelected.type,
              apikey: apiKey
            })

            if (!request) {
              if (message) {
                await message.reply(
                  instance.messageHandler.get(guild, 'DEFAULT_ERROR')
                )
                return
              } else {
                await statusInt.editReply({
                  content: instance.messageHandler.get(guild, 'DEFAULT_ERROR'),
                  components: []
                })
                return
              }
            }

            const embed = new MessageEmbed()

            const serverInfo = sanitizeResponse(
              request.getServerInfo,
              serverSelected.type,
              serverSelected.description ?? 'The best server is the world'
            )

            if (serverInfo?.serverData) {
              const data = serverInfo?.serverData
              embed
                .setFields([
                  {
                    name: 'Slots',
                    value: data.slots
                  },
                  {
                    name: 'Connect',
                    value: data.connect
                  },
                  {
                    name: 'Players',
                    value: data.players
                  }
                ])
                .setTitle(data.title)
                .setThumbnail(data.thumbUrl)
                .setAuthor({
                  name: 'Apollo Servers',
                  url: 'https://github.com/henriquemod'
                })
                .setDescription(data.desc)
                .setFooter({
                  text: data.tags
                })
              if (data.mapUrl.length > 1) {
                embed.setImage(data.mapUrl)
              }
            } else if (serverInfo?.errors) {
              const fields = serverInfo.errors.map(
                (error) =>
                  ({
                    name: error.errorType,
                    value: error.message
                  } as EmbedFieldData)
              )

              if (message) {
                await message.reply({
                  embeds: [
                    new MessageEmbed()
                      .setTitle('Offline')
                      .setDescription('Offline')
                      .setFields(fields)
                  ]
                })
                return
              } else {
                await statusInt.editReply({
                  content: '.',
                  embeds: [
                    new MessageEmbed()
                      .setTitle('Offline')
                      .setDescription('Offline')
                      .setFields(fields)
                  ],
                  components: []
                })
                return
              }
            } else {
              embed.setTitle('Offline').setDescription('Offline')
            }
            if (message) {
              await message.channel.send({
                embeds: [embed]
              })
              return
            }
            await statusInt.editReply({
              content: '.',
              embeds: [embed],
              components: []
            })
          } else {
            await statusInt.editReply({
              content: instance.messageHandler.get(guild, 'CANCEL_ACTION'),
              components: []
            })
          }
        })
      }
    }
  }
} as ICommand
