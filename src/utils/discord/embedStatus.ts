import * as DJS from 'discord.js'
import { codeBlock } from '@discordjs/builders'
import { C_SUCCESS } from '../../config/colors'
import { SingleServer, SrvMinimalInfo } from '../../types/responses'
import { limitString, getDate } from '../'
import { mediumEmberdDivider } from './embedUtils'
import IDate from '../../types/date'
import { appContext } from '../../.'

interface SuccessProps {
  data: SingleServer
  embed: DJS.MessageEmbed
  date: IDate
  guild: DJS.Guild
}

export const singleSuccessEmbed = ({
  embed,
  data,
  date,
  guild
}: SuccessProps): void => {
  const { instance } = appContext
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
    const namesField: DJS.EmbedFieldData = {
      name: 'Players',
      value: codeBlock(nameField),
      inline: true
    }
    const scoresField: DJS.EmbedFieldData = {
      name: 'Score',
      value: codeBlock(scoreField),
      inline: true
    }
    const timesField: DJS.EmbedFieldData = {
      name: 'Time',
      value: codeBlock(timeField),
      inline: true
    }
    embed.addFields([namesField, scoresField, timesField])
  }

  embed.setFooter({
    text: instance.messageHandler.get(guild, 'UPDATED_AT', {
      DATE: getDate(date)
    })
  })

  embed
    .setTitle(limitString(data.title, 50))
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
): DJS.EmbedFieldData[] => {
  const serverData: DJS.EmbedFieldData = {
    name: 'Servidor',
    value: codeBlock(limitString(server.title, 50))
  }

  const gameData: DJS.EmbedFieldData = {
    name: 'Game',
    value: codeBlock(limitString(server.game, 50))
  }

  const connectData: DJS.EmbedFieldData = {
    name: 'Connect',
    value: codeBlock(server.connect),
    inline: true
  }

  const slotsData: DJS.EmbedFieldData = {
    name: 'Slots',
    value: codeBlock(server.players),
    inline: true
  }
  const result = [serverData, gameData, connectData, slotsData]

  if (basDivider) {
    return [...result, mediumEmberdDivider]
  }

  return result
}
