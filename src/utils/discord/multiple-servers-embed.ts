import { GetMultiplesServerInfoQuery } from '../../generated/graphql'
import { codeBlock } from '@discordjs/builders'
import * as DJS from 'discord.js'
import {
  fullEmberdDivider,
  makeEmdedOptions,
  makeOffileEmbend
} from './embedUtils'
import WOKCommands from 'wokcommands'
import { sanitizeListResponse } from '../sanitizeResponse'
import { C_SUCCESS } from '../../config/colors'
import { minimalStatusEmbed } from './embedStatus'
import { createEmbedsGroups } from '../splitGroups'
import { embedPaginated } from './embedPaginated'
import { MessageController } from '../../controllers/messages-controller'

export interface REmbedProps {
  result: GetMultiplesServerInfoQuery['getMultiplesServerInfo']
  instance: WOKCommands
  guild: DJS.Guild
  msgnController: MessageController
  channel: DJS.TextChannel
  authorid: string
}

export const errorEmbed = async ({
  result,
  instance,
  msgnController,
  guild
}: REmbedProps): Promise<void> => {
  if (!result?.errors) {
    return
  }
  const errors = result.errors

  const fields = errors.map(
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
  await msgnController.replyOrEdit(replymsgn)
}

export const successEmbed = async ({
  result,
  channel,
  msgnController,
  authorid
}: REmbedProps): Promise<void> => {
  const index = 0

  const data = sanitizeListResponse(result)
  if (data) {
    const embed = new DJS.MessageEmbed()
      .setTitle('Servers List')
      .setColor(C_SUCCESS)

    const serversFields = data.servers.map((server, i, arr) => {
      if (i === arr.length - 1) {
        return minimalStatusEmbed(server)
      } else {
        return minimalStatusEmbed(server, true)
      }
    })

    const length = serversFields.length
    let grouped = 0

    if (length <= 4) {
      grouped = 1
    } else if (length <= 8) {
      grouped = 2
    } else if (length <= 12) {
      grouped = 3
    } else if (length <= 16) {
      grouped = 4
    } else {
      grouped = 5
    }

    const groupedServers = createEmbedsGroups(serversFields, grouped)
    await msgnController.editReply('.')

    const botMessage = await channel.send({
      embeds: [embed]
    })

    const msgnObj: DJS.Message | DJS.CommandInteraction<DJS.CacheType> =
      msgnController.getBotMessage()

    await embedPaginated({
      embed,
      groupedServers,
      index,
      size: groupedServers.length,
      channel,
      authorid,
      msgn: botMessage,
      authorMessage: msgnObj,
      callback: embedPaginated,
      timeout: 15
    })
  }
}
