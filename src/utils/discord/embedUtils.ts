import {
  MessageEmbed,
  MessageActionRow,
  BaseMessageComponentOptions,
  MessageActionRowOptions,
  ReplyMessageOptions,
  EmbedFieldData
} from 'discord.js'
import { C_DANGER } from '../../config/colors'
import { codeBlock } from '@discordjs/builders'

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

export const makeOffileEmbend = (fields?: EmbedFieldData[]): MessageEmbed => {
  const embed = new MessageEmbed()
    .setTitle('Request failed')
    .setDescription(
      codeBlock(
        'Please try again later an if the problem persist, contact the bot owner'
      )
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

export const fullEmberdDivider: EmbedFieldData = {
  name: '▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃',
  value: '\u200b'
}
