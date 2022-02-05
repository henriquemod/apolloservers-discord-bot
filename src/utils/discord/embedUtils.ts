import {
  MessageEmbed,
  MessageActionRow,
  BaseMessageComponentOptions,
  MessageActionRowOptions,
  ReplyMessageOptions,
  EmbedFieldData
} from 'discord.js'
import { C_DANGER } from '../../config/colors'

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
    .setTitle('Offline')
    .setDescription('Offline')

    .setColor(C_DANGER)

  if (fields) {
    embed.setFields(fields)
  }

  return embed
}
