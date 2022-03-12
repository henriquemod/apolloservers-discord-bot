import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction
} from 'discord.js'
import { ICommand } from 'wokcommands'
import log4jConfig, { APP_COMMAND_ERROR } from '../../../config/log4jConfig'
import guildServersSchema, { Server } from '../../../models/guild-servers'
import { __prod__, createGroups } from '../../../utils'

const log = log4jConfig(['app', 'out']).getLogger('APP')

export default {
  category: 'Admin Panel',
  description: 'Remove a server from your server list',
  permissions: ['ADMINISTRATOR'],
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

  callback: async ({ interaction: msgInt, channel, guild, instance }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }
    const find = await guildServersSchema.findById({ _id: guild.id })
    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }
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

      await msgInt.reply({
        content: instance.messageHandler.get(guild, 'SELECT_SERVER'),
        components: rows.map((row) => row),
        ephemeral: true
      })

      const filter = (btnInt: MessageComponentInteraction): boolean => {
        return btnInt.user.id === msgInt.user.id
      }

      const collector = channel.createMessageComponentCollector({
        filter,
        max: 1,
        time: 1000 * 5
      })

      collector.on('collect', async (i: ButtonInteraction) => {
        await i.reply({
          content: instance.messageHandler.get(guild, 'DEFAULT_EDITED'),
          ephemeral: true
        })
      })

      const deleteServer = async (id: string): Promise<void> => {
        try {
          await guildServersSchema.findByIdAndUpdate(
            { _id: guild.id },
            { $pull: { servers: { _id: id } } }
          )
        } catch (error) {
          console.log(error)
        }
      }

      collector.on('end', async (collection) => {
        collection.forEach((click) => {
          deleteServer(click.customId).catch((err) => {
            console.log(err)
          })
        })

        await msgInt.editReply({
          content: instance.messageHandler.get(
            guild,
            collection.size === 0 ? 'NO_SERVER_SELECTED' : 'SERVER_DELETED'
          ),
          components: []
        })
      })
    }
  }
} as ICommand
