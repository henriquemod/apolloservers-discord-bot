/* eslint-disable @typescript-eslint/restrict-template-expressions */
// ! no-non-null-assertion is disabled cause __pwencription__ if validate if exists on boot load se we know for sure that it exists
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  EmbedFieldData,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from 'discord.js'
import { csgoMap } from '../utils/urls/csgoMapsUrl'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../models/guild-servers'
import { ServerProps } from '../types/server'
import { __prod__, __pwencription__ } from '../utils/constants'
import EncryptorDecryptor from '../utils/encryption'
import { serverInfoRequest } from '../utils/requests/serverInfoRequest'

const encryption = new EncryptorDecryptor()

export default {
  category: 'Servers',
  description: 'Show a server info',
  slash: 'both',
  testOnly: !__prod__,

  callback: async ({ interaction: statusInt, channel, guild }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }

    const find = await guildServersSchema.findById({ _id: guild.id })

    if (!find) {
      return 'Server not configured'
    } else {
      const servers = find.servers as ServerProps[]
      if (!servers) {
        return 'This discord have no servers added'
      } else {
        const serversRows = servers.map((server) =>
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(server.id)
              .setEmoji('🎮')
              .setLabel(server.name)
              .setStyle('SECONDARY')
          )
        )

        serversRows.push(
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId('btn_cancel')
              .setLabel('Cancel')
              .setStyle('DANGER')
          )
        )

        await statusInt.reply({
          content: 'Select a server:',
          components: serversRows,
          ephemeral: true
        })

        const filter = (btnInt: MessageComponentInteraction): boolean => {
          return btnInt.user.id === statusInt.user.id
        }

        const collector = channel.createMessageComponentCollector({
          filter,
          max: 1,
          time: 1000 * 15
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

            const apiKey = encryption.decryptString(
              find.apiKey,
              __pwencription__
            )

            const serverSelected = query.servers[0] as ServerProps

            const request = await serverInfoRequest({
              host: serverSelected.host,
              port: serverSelected.port,
              type: serverSelected.type,
              apikey: apiKey
            })

            const embed = new MessageEmbed()

            if (request.getServerInfo?.response) {
              const server = request.getServerInfo.response
              const embendFields: EmbedFieldData[] = []

              let playersList = ''
              server.players.forEach((player) => {
                if (
                  player.name.length !== 0 &&
                  typeof player.raw.score === 'string'
                ) {
                  playersList += ` ${player.name}  \\ `
                }
              })

              playersList = playersList.slice(0, playersList.length - 2)

              const mapUrl = csgoMap.get(request.getServerInfo.response.map)
              let tags = ''
              request.getServerInfo.response.raw.tags?.forEach((tag) => {
                tags += `${tag}, `
              })

              tags = tags.slice(0, tags.length - 2)

              const numPlayers = request.getServerInfo.response.raw.numplayers
              const maxPlayers = request.getServerInfo.response.maxplayers

              embendFields.push({
                name: 'Slots',
                value: `${numPlayers ?? '-'}/${maxPlayers}`
              })

              embendFields.push({
                name: 'Connect',
                value: `connect ${request.getServerInfo.response.connect}`
              })

              embendFields.push({
                name: 'Players',
                value: playersList
              })

              embed
                .setTitle(request.getServerInfo.response.name)
                .setDescription(
                  serverSelected.description ?? 'The best server is the world'
                )
                .setThumbnail(
                  'https://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/6d/6d448876809d7b79aa8f070271c07b1296459400_full.jpg'
                )
                .setAuthor({
                  name: 'Apollo Servers',
                  url: 'https://github.com/henriquemod'
                })
                .setFooter({
                  text: `Tags: ${tags}`
                })

              if (mapUrl) {
                embed.setImage(mapUrl)
              }
              if (embendFields.length > 0) {
                embed.setFields(embendFields)
              }
            } else {
              embed.setTitle('Offline').setDescription('Offline')
            }
            await statusInt.editReply({
              content: '.',
              embeds: [embed],
              components: []
            })
          } else {
            await statusInt.editReply({
              content: 'You canceled me, how could you do this?  😥',
              components: []
            })
          }
        })
      }
    }
  }
} as ICommand
