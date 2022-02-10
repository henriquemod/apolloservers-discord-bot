import {
  MessageEmbed,
  EmbedFieldData,
  TextChannel,
  Message,
  CommandInteraction,
  CacheType,
  MessageReaction,
  User
} from 'discord.js'

interface Props {
  embed: MessageEmbed
  groupedServers: EmbedFieldData[][][]
  index: number
  size: number
  channel: TextChannel
  authorid: string
  msgn: Message
  authorMessage: Message | CommandInteraction<CacheType>
  callback: (props: Props) => Promise<boolean>
  timeout: number
}

export default async ({
  embed,
  groupedServers,
  index,
  size,
  channel,
  authorid,
  msgn,
  authorMessage,
  callback,
  timeout
}: Props): Promise<boolean> => {
  embed.setFields(...groupedServers[index])
  embed.setFooter({ text: `Page ${index + 1} of ${size}` })

  msgn = await updateMessage(msgn, embed, channel)
  const fist = index === 0
  const last = index === size - 1
  await buildReactions(msgn, fist, last)

  const filter = (_m: MessageReaction, user: User): boolean => {
    return user.id === authorid
  }

  const collector = msgn.createReactionCollector({
    filter,
    time: 1000 * timeout
  })

  let haveInteraction = false
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  collector.on('collect', async (reaction) => {
    if (reaction.emoji.name === '⏮') {
      embed.setFields(...groupedServers[0])
      index = 0
      haveInteraction = true
    }
    if (reaction.emoji.name === '◀') {
      embed.setFields(...groupedServers[index--])
      haveInteraction = true
    }
    if (reaction.emoji.name === '▶') {
      embed.setFields(...groupedServers[index++])
      haveInteraction = true
    }
    if (reaction.emoji.name === '⏭') {
      embed.setFields(...groupedServers[groupedServers.length - 1])
      index = groupedServers.length - 1
      haveInteraction = true
    }
    if (reaction.emoji.name === '🚪') {
      if (authorMessage instanceof Message) {
        await Promise.all([msgn.delete(), authorMessage.delete()])
      } else {
        await msgn.delete()
      }
      return
    }
    msgn = await updateMessage(msgn, embed, channel)

    // eslint-disable-next-line node/no-callback-literal
    await callback({
      embed: embed,
      groupedServers: groupedServers,
      index,
      size,
      channel,
      authorid,
      msgn,
      authorMessage,
      callback: callback,
      timeout
    })
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      if (authorMessage instanceof Message) {
        await Promise.all([msgn.delete(), authorMessage.delete()])
      } else {
        await msgn.delete()
      }
      return false
    }
  })

  return haveInteraction
}

const updateMessage = async (
  msgn: Message,
  embed: MessageEmbed,
  channel: TextChannel
): Promise<Message> => {
  const result = await Promise.all([
    msgn.delete(),
    await channel.send({
      embeds: [embed]
    })
  ])
  return result[1]
}

const buildReactions = async (
  msgn: Message,
  fist: boolean,
  last: boolean
): Promise<void> => {
  try {
    if (!fist) {
      await msgn.react('⏮')
      await msgn.react('◀')
    }
    if (!last) {
      await msgn.react('▶')
      await msgn.react('⏭')
    }
    await msgn.react('🚪')
  } catch (error) {
    console.error('One of the emojis failed to react:', error)
  }
}
