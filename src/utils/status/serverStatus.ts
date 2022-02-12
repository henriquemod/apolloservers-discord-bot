import * as DJS from 'discord.js'
import { ServerProps } from '../../types/server'
import { C_DANGER } from '../../config/colors'
import { successEmbed } from '../discord/embedStatus'
import {
  makeEmdedOptions,
  fullEmberdDivider,
  makeOffileEmbend
} from '../discord/embedUtils'
import { serverInfoRequest } from '../requests/serverInfoRequest'
import { sanitizeResponse } from '../sanitizeResponse'
import WOKCommands from 'wokcommands'
import { codeBlock } from '@discordjs/builders'
import IDate from '../../types/date'

interface Props {
  server: ServerProps
  apikey: string
  instance: WOKCommands
  guild: DJS.Guild
  message: DJS.Message | DJS.CommandInteraction<DJS.CacheType>
  embed: DJS.MessageEmbed
  date: IDate
}

export const serverStatus = async ({
  server,
  apikey,
  instance,
  guild,
  message,
  embed,
  date
}: Props): Promise<void> => {
  const request = await serverInfoRequest({
    host: server.host,
    port: server.port,
    type: server.type,
    apikey,
    instance,
    guild
  })

  if (!request) {
    // return makeEmdedOptions({
    //   content: instance.messageHandler.get(guild, 'DEFAULT_ERROR')
    // })
    return
  }

  // testMessage = new DJS.MessageEmbed()

  const serverInfo = sanitizeResponse(
    request.getServerInfo,
    server.type,
    server.description ?? 'The best server is the world'
  )

  if (serverInfo?.serverData) {
    successEmbed({ data: serverInfo?.serverData, embed, date, guild })
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
        } as DJS.EmbedFieldData)
    )

    fields.unshift(fullEmberdDivider)
    const replymsgn = makeEmdedOptions({
      embed: makeOffileEmbend(instance, guild, fields)
    })

    if (message instanceof DJS.Message) {
      await Promise.all([message.reply(replymsgn)])
    } else {
      await message.editReply(replymsgn)
    }

    return
  } else {
    /**
     * NOTE - If neither serverData nor errors are present,
     *        it means that the server is possibly offline
     *        or missconfigured, in this case, we just want
     *        to show a default offline embed to discord server
     */
    embed.setTitle('Offline').setDescription('Offline').setColor(C_DANGER)
  }

  // const insert = await addSchedule({
  //   guildid: guild.id,
  //   serverid: server.data.id,
  //   messageid: botMessage.id
  // })

  if (message instanceof DJS.Message) {
    await Promise.all([message.channel.send(makeEmdedOptions({ embed }))])
  } else {
    await message.editReply(makeEmdedOptions({ embed }))
  }

  // return `${insert ? 'Added' : 'Error'} schedule for ${server.data.name}`
}
