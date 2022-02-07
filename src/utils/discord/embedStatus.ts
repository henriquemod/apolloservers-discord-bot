import { EmbedFieldData, MessageEmbed } from 'discord.js'
import { codeBlock } from '@discordjs/builders'
import { C_SUCCESS } from '../../config/colors'
import { SingleServer, SrvMinimalInfo } from '../../types/responses'
import { limitString } from '../limiter'
import { emberdDivider } from './embedUtils'

interface SuccessProps {
  data: SingleServer
  embed: MessageEmbed
}

export const successEmbed = ({ embed, data }: SuccessProps): void => {
  embed.setFields([
    {
      name: 'Slots',
      value: codeBlock(data.slots),
      inline: true
    },
    {
      name: 'Connect',
      value: codeBlock(data.connect),
      inline: true
    },
    {
      name: 'Tags',
      value: codeBlock(data.tags)
    }
  ])

  if (data.players.length > 0) {
    let nameField = ''
    let scoreField = ''
    let timeField = ''
    data.players.forEach((player) => {
      const timeFormatted = new Date(player.time * 1000)
        .toISOString()
        .substring(11, 19)

      if (player.score >= 0) {
        nameField += `${player.name}\n`
        scoreField += `${player.score}\n`
        timeField += `${timeFormatted}\n`
      }
    })
    const namesField: EmbedFieldData = {
      name: 'Players',
      value: codeBlock(nameField),
      inline: true
    }
    const scoresField: EmbedFieldData = {
      name: 'Score',
      value: codeBlock(scoreField),
      inline: true
    }
    const timesField: EmbedFieldData = {
      name: 'Time',
      value: codeBlock(timeField),
      inline: true
    }
    embed.addFields([namesField, scoresField, timesField])
  }

  embed
    .setTitle(data.title)
    .setAuthor({
      name: 'Apollo Servers',
      url: 'https://github.com/henriquemod'
    })
    .setDescription(codeBlock(data.desc))
    .setColor(C_SUCCESS)
  if (data.mapUrl.length > 1) {
    embed.setImage(data.mapUrl)
  }
}

export const minimalStatusEmbed = (
  server: SrvMinimalInfo,
  basDivider?: boolean
): EmbedFieldData[] => {
  const serverData: EmbedFieldData = {
    name: 'Servidor',
    value: codeBlock(limitString(server.title, 50))
  }

  const gameData: EmbedFieldData = {
    name: 'Game',
    value: codeBlock(limitString(server.game, 50))
  }

  const connectData: EmbedFieldData = {
    name: 'Connect',
    value: codeBlock(server.connect),
    inline: true
  }

  const slotsData: EmbedFieldData = {
    name: 'Slots',
    value: codeBlock(server.players),
    inline: true
  }
  const result = [serverData, gameData, connectData, slotsData]

  if (basDivider) {
    return [...result, emberdDivider]
  }

  return result
}
