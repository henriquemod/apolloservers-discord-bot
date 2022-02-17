import {
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  ReplyMessageOptions
} from 'discord.js'
import { cond } from 'ramda'
import { ICommand } from 'wokcommands'
import { appContext } from '../.'
import log4jConfig, { APP_COMMAND_ERROR } from '../config/log4jConfig'
import { MessageController } from '../controllers/messages-controller'
import guildServersSchema, { Guild, Server } from '../models/guild-servers'
import { ServerProps } from '../types/server'
import {
  createGroups,
  EncryptorDecryptor,
  generalOfflineEmbed,
  makeEmdedOptions,
  sanitizeResponse,
  serverInfoRequest,
  singleServerEmbed,
  SingleServerEmbedProps,
  singleServerError,
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
    const msgnController = new MessageController(message, statusInt)
    const context = appContext

    const find = await guildServersSchema.findById({ _id: guild.id })

    if (!find) {
      return instance.messageHandler.get(guild, 'ERROR_SERVER_NOT_CONFIGURED')
    }

    const queryResult: Guild = find

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

    await msgnController.replyto(obj)

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

        await msgnController.replyOrEdit(errormsg)

        return
      }

      if (query.servers.length === 0) {
        const errormsg = makeEmdedOptions({
          content: instance.messageHandler.get(guild, 'NO_SERVER_SELECTED')
        })

        await msgnController.replyOrEdit(errormsg, true)

        return
      }

      const serverSelected = query.servers[0] as ServerProps

      if (!serverSelected) return

      const apiKey = encryption.decryptString(find.apiKey, context.masterkey)

      await msgnController.sendOrEdit(
        makeEmdedOptions({ embed: statusSkeleton() })
      )

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

        await msgnController.replyOrEdit(errormsg, true)

        return
      }

      const embed = new MessageEmbed()

      const serverInfo = sanitizeResponse(
        request.getServerInfo,
        serverSelected.type,
        serverSelected.description ?? 'The best server is the world'
      )

      const obj: SingleServerEmbedProps = {
        guild,
        instance,
        message,
        interaction: statusInt,
        server: serverInfo,
        botMessageStatus: msgnController.getMessageStatus(),
        embed,
        guildQuery: queryResult
      }

      const fn = cond([
        [(x) => !x.server, generalOfflineEmbed],
        [(x) => !!x.server?.errors, singleServerError],
        [(x) => !!x.server?.serverData, singleServerEmbed]
      ])

      await fn(obj)
    })
  }
} as ICommand
