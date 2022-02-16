import { codeBlock } from '@discordjs/builders'
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
import { appContext } from '../.'
import { C_DANGER } from '../config/colors'
import log4jConfig, { APP_COMMAND_ERROR } from '../config/log4jConfig'
import guildServersSchema, { Server } from '../models/guild-servers'
import { ServerProps } from '../types/server'
import {
  createGroups,
  EncryptorDecryptor,
  makeEmdedOptions,
  makeOffileEmbend,
  mediumEmberdDivider,
  sanitizeResponse,
  serverInfoRequest,
  singleSuccessEmbed,
  statusSkeleton,
  __prod__
} from '../utils'

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
    const context = appContext

    let botMessage: Message
    let botMessageStatus: Message

    const find = await guildServersSchema.findById({ _id: guild.id })

    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }

    const servers = find.servers as Server[]

    if (!servers || servers.length === 0) {
      return instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
    }

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
          content: instance.messageHandler.get(guild, 'ERROR_NONE_GAMESERVER')
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

      const apiKey = encryption.decryptString(find.apiKey, context.masterkey)

      if (message) {
        const msgn = await Promise.all([
          message.channel.send(makeEmdedOptions({ embed: statusSkeleton() })),
          botMessage.delete()
        ])
        botMessageStatus = msgn[0]
      } else {
        await statusInt.editReply(makeEmdedOptions({ embed: statusSkeleton() }))
      }

      const request = await serverInfoRequest({
        host: serverSelected.host,
        port: serverSelected.port,
        type: serverSelected.type,
        apikey: apiKey,
        instance,
        guild
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

      if (!serverInfo) {
        embed.setTitle('Offline').setDescription('Offline').setColor(C_DANGER)
      }

      if (serverInfo?.serverData) {
        singleSuccessEmbed({
          data: serverInfo?.serverData,
          embed,
          date: { locale: find.locale, timezone: find.timezone },
          guild
        })

        if (message) {
          await Promise.all([
            message.channel.send(makeEmdedOptions({ embed })),
            botMessageStatus.delete()
          ])
        } else {
          await statusInt.editReply(makeEmdedOptions({ embed }))
        }
        return
      }

      if (serverInfo?.errors) {
        const fields = serverInfo.errors.map(
          (error) =>
            ({
              name: error.errorType,
              value: codeBlock(error.message ?? 'Unknown error')
            } as EmbedFieldData)
        )

        fields.unshift(mediumEmberdDivider)

        const replymsgn = makeEmdedOptions({
          embed: makeOffileEmbend(instance, guild, fields)
        })

        if (message) {
          await Promise.all([
            message.reply(replymsgn),
            botMessageStatus.delete()
          ])
        } else {
          await statusInt.editReply(replymsgn)
        }
      }
    })
  }
} as ICommand
