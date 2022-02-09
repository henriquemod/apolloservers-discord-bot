import { EmbedFieldData, MessageEmbed } from 'discord.js'
import { codeBlock } from '@discordjs/builders'
import { C_SECONDARY } from '../../config/colors'
import { emberdDivider } from '../discord/embedUtils'

export const statusSkeleton = (): MessageEmbed => {
  const embed = new MessageEmbed()

  embed.addFields([emberdDivider])

  embed.addFields([
    {
      name: 'Slots',
      value: codeBlock('loading...'),
      inline: true
    },
    {
      name: 'Connect',
      value: codeBlock('loading...'),
      inline: true
    },
    {
      name: 'Tags',
      value: codeBlock('loading...')
    }
  ])

  const namesField: EmbedFieldData = {
    name: 'Players',
    value: codeBlock('loading...'),
    inline: true
  }
  const scoresField: EmbedFieldData = {
    name: 'Score',
    value: codeBlock('loading...'),
    inline: true
  }
  const timesField: EmbedFieldData = {
    name: 'Time',
    value: codeBlock('loading...'),
    inline: true
  }
  embed.addFields([namesField, scoresField, timesField])

  embed
    .setTitle('loading...')
    .setAuthor({
      name: 'Apollo Servers',
      url: 'https://github.com/henriquemod'
    })
    .setDescription(codeBlock('loading...'))
    .setColor(C_SECONDARY)

  return embed
}
