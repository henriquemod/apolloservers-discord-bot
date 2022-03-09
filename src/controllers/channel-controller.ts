import * as DJS from 'discord.js'
import { _testContext_ } from '../utils'
import { TestContext } from '../lib/testContext'

interface Props {
  guild: DJS.Guild
  channel: string | DJS.GuildBasedChannel | null
}

export class ChannelController {
  public readonly guild: DJS.Guild
  public readonly channel: string | DJS.GuildBasedChannel | null
  public readonly context: TestContext | undefined

  constructor({ guild, channel }: Props) {
    this.guild = guild
    this.channel = channel
    this.context = _testContext_
  }

  public isValidTextChannel = (): DJS.GuildTextBasedChannel | undefined => {
    if (!this.channel) return

    if (!!process.env.TEST && this.context?.isValidTextChannel) {
      if (typeof this.channel === 'string') {
        return {
          id: this.channel,
          type: 'text'
        } as unknown as DJS.GuildTextBasedChannel
        // return this.channel
      } else {
        return this.channel as DJS.GuildTextBasedChannel
      }
    }

    if (this.channel instanceof DJS.GuildChannel) {
      if (this.channel.isText()) {
        return this.channel as DJS.GuildTextBasedChannel
      }
    }
    if (typeof this.channel === 'string') {
      try {
        const result = this.guild.channels.cache.get(this.channel)
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (result?.isText()) {
          return result
        }
      } catch (error) {}
    }
  }
}
