import { codeBlock } from '@discordjs/builders'
import * as DJS from 'discord.js'
import IDate from '../../types/date'
import WOKCommands from 'wokcommands'
import { C_DANGER } from '../../config/colors'
import { ServerProps } from '../../types/server'
import { singleSuccessEmbed } from '../discord/embedStatus'
import {
  fullEmberdDivider,
  makeEmdedOptions,
  makeOffileEmbend
} from '../discord/embedUtils'
import { serverInfoRequest } from '../requests/serverInfoRequest'
import { sanitizeResponse } from '../sanitizeResponse'

interface Props {
  server: ServerProps // Represents the actial server with its properties
  apikey: string // Apoy key for the server
  instance: WOKCommands // Instance of the WOKCommands
  guild: DJS.Guild // Guild where the command was executed
  message: DJS.Message // Message where the command was executed, this is the message that will be edited over time
  embed: DJS.MessageEmbed // Embed that will be manipulated over time and sent with the message
  date: IDate
}

export const updateByClientDJS = async ({
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
    return
  }

  const serverInfo = sanitizeResponse(
    request.getServerInfo,
    server.type,
    server.description ?? 'The best server is the world'
  )

  if (serverInfo?.serverData) {
    singleSuccessEmbed({ data: serverInfo?.serverData, embed, date, guild })
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

    await message.edit(replymsgn)
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

  await message.edit(makeEmdedOptions({ embed }))
}
