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

  callback: async ({ interaction: msgInt, channel, guild, instance }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }
    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
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
          .setLabel(instance.messageHandler.get(guild, 'BTN_CANCEL_LBL'))
          .setStyle('DANGER')
      )
    )

    await msgInt.reply({
      content: instance.messageHandler.get(guild, 'SELECT_SERVER'),
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
        content: instance.messageHandler.get(guild, 'DEFAULT_EDITED'),
        ephemeral: true
      })
    })

    let wasAServer = false

    const deleteServer = async (id: string): Promise<boolean> => {
      try {
        await guildServersSchema.findByIdAndUpdate(
          { _id: guild.id },
          { $pull: { servers: { _id: id } } }
        )
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
              content: instance.messageHandler.get(guild, 'DEFAULT_ERROR')
            })
          })
        }
      })

      await msgInt.editReply({
        content: wasAServer
          ? instance.messageHandler.get(guild, 'SERVER_DELETED')
          : instance.messageHandler.get(guild, 'CANCEL_ACTION'),
        components: []
      })
    })
  }
} as ICommand
