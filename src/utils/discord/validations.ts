import * as DJS from 'discord.js'
interface Props {
  guild: DJS.Guild
  channel: string | DJS.GuildBasedChannel | null
}
export const isValidTextChannel = async ({
  guild,
  channel
}: Props): Promise<DJS.GuildTextBasedChannel | undefined> => {
  if (!channel) return
  if (channel instanceof DJS.GuildChannel) {
    if (channel.isText()) {
      return channel as DJS.GuildTextBasedChannel
    }
  }
  if (typeof channel === 'string') {
    try {
      const result = guild.channels.cache.get(channel)
      if (result?.isText()) {
        return result
      }
    } catch (error) {}
  }
}
