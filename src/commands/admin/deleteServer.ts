/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { __prod__ } from '../../utils/constants'
import { ICommand } from 'wokcommands'
import guildServersSchema from '../../models/guild-servers'
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction
} from 'discord.js'
import { ServerProps } from '../../types/server'

export default {
  category: 'Admin Panel',
  description: 'Remove a server from your server list',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  testOnly: !__prod__,

  callback: async ({ interaction: msgInt, channel, guild }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }
    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return 'Nenhum servidor salvo'
    }
    const servers = find.servers as ServerProps[]

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

    await msgInt.reply({
      content: 'Select a server to delete:',
      components: serversRows,
      ephemeral: true
    })

    const filter = (btnInt: MessageComponentInteraction): boolean => {
      return btnInt.user.id === msgInt.user.id
    }

    const collector = channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 15
    })

    collector.on('collect', async (i: ButtonInteraction) => {
      await i.reply({
        content: 'You did something nasty',
        ephemeral: true
      })
    })

    let wasAServer = false

    const deleteServer = async (id: string): Promise<boolean> => {
      try {
        await guildServersSchema.deleteOne({ id })
        wasAServer = true
        return true
      } catch (error) {
        return false
      }
    }
    collector.on('end', async (collection) => {
      collection.forEach((click) => {
        if (click.customId !== 'btn_cancel') {
          deleteServer(click.customId).catch(async (err) => {
            console.log(err)
            await msgInt.reply({
              content:
                'Some wild error appeared, please contact the developer 👨‍💻'
            })
          })
        }
      })

      await msgInt.editReply({
        content: wasAServer
          ? 'A server was deleted 😥'
          : "You've canceled the action",
        components: []
      })
    })
  }
} as ICommand
