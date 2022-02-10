import {
  MessageEmbed,
  MessageActionRow,
  BaseMessageComponentOptions,
  MessageActionRowOptions,
  ReplyMessageOptions,
  EmbedFieldData,
  Guild
} from 'discord.js'
import { C_DANGER } from '../../config/colors'
import { codeBlock } from '@discordjs/builders'
import WOKCommands from 'wokcommands'

interface MakeEmbedProps {
  embed?: MessageEmbed
  component?:
    | MessageActionRow
    | (Required<BaseMessageComponentOptions> & MessageActionRowOptions)
  content?: string
}

export const makeEmdedOptions = ({
  embed,
  component,
  content
}: MakeEmbedProps): ReplyMessageOptions => {
  return {
    content: content ?? null,
    embeds: embed ? [embed] : [],
    components: component ? [component] : []
  }
}

export const makeOffileEmbend = (
  instance: WOKCommands,
  guild: Guild,
  fields?: EmbedFieldData[]
): MessageEmbed => {
  const embed = new MessageEmbed()
    .setTitle('Request failed')
    .setDescription(
      codeBlock(instance.messageHandler.get(guild, 'REQUEST_FAILED'))
    )

    .setColor(C_DANGER)

  if (fields) {
    embed.setFields(fields)
  }

  return embed
}

export const emberdDivider: EmbedFieldData = {
  name: '▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃',
  value: '\u200b'
}

export const mediumEmberdDivider: EmbedFieldData = {
  name: '▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃',
  value: '\u200b'
}

export const fullEmberdDivider: EmbedFieldData = {
  name: '▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃',
  value: '\u200b'
}
