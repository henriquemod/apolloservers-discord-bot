import * as DJS from 'discord.js'
interface Props {
  guild: DJS.Guild
  channel: string | null
}
export const isValidTextChannel = async ({
  guild,
  channel
}: Props): Promise<DJS.GuildTextBasedChannel | undefined> => {
  if (!channel) return
  try {
    const result = guild.channels.cache.get(channel)
    if (result?.isText()) {
      return result
    }
  } catch (error) {}
}
