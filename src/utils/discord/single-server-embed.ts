import * as DJS from 'discord.js'
import { codeBlock } from '@discordjs/builders'
import { SingleServerResponse } from '../../types/responses'
import {
  makeEmdedOptions,
  makeOffileEmbend,
  mediumEmberdDivider,
  singleSuccessEmbed
} from '.'
import { EmbedFieldData } from 'discord.js'
import { Guild } from '../../models/guild-servers'
import WOKCommands from 'wokcommands'
import { C_DANGER } from '../../config/colors'

export interface SingleServerEmbedProps {
  server?: SingleServerResponse
  embed?: DJS.MessageEmbed
  guild: DJS.Guild
  guildQuery?: Guild
  message: DJS.Message
  botMessageStatus: DJS.Message
  instance?: WOKCommands
  interaction: DJS.CommandInteraction<DJS.CacheType>
}

export const singleServerEmbed = async ({
  server,
  embed,
  guild,
  message,
  botMessageStatus,
  guildQuery,
  interaction
}: SingleServerEmbedProps): Promise<void> => {
  if (!server?.serverData || !embed || !guildQuery) return
  singleSuccessEmbed({
    data: server?.serverData,
    embed,
    date: { locale: guildQuery.locale, timezone: guildQuery.timezone },
    guild
  })

  if (message) {
    await Promise.all([
      message.channel.send(makeEmdedOptions({ embed })),
      botMessageStatus.delete()
    ])
  } else {
    await interaction.editReply(makeEmdedOptions({ embed }))
  }
}

export const singleServerError = async ({
  server,
  message,
  interaction,
  botMessageStatus,
  guild,
  instance
}: SingleServerEmbedProps): Promise<void> => {
  if (!server?.errors || !instance) return
  const fields = server.errors.map(
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
    await Promise.all([message.reply(replymsgn), botMessageStatus.delete()])
  } else {
    await interaction.editReply(replymsgn)
  }
}

export const generalOfflineEmbed = async ({
  embed,
  message,
  interaction,
  botMessageStatus
}: SingleServerEmbedProps): Promise<void> => {
  embed?.setTitle('Offline').setDescription('Offline').setColor(C_DANGER)
  if (message) {
    await Promise.all([
      message.reply(makeEmdedOptions({ embed })),
      botMessageStatus.delete()
    ])
  } else {
    await interaction.editReply(makeEmdedOptions({ embed }))
  }
}
