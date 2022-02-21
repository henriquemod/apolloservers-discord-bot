import * as DJS from 'discord.js'
import { Messages } from '../interfaces/messages'

interface ArgsSchema {
  args: string[]
  labels: string[]
}

export class MessageController implements Messages {
  public readonly message: DJS.Message | DJS.CommandInteraction<DJS.CacheType>
  private readonly isMessage: boolean
  private args: Map<string, string | DJS.GuildTextBasedChannel>
  private botMessage: DJS.Message
  private messageStatus: DJS.Message

  constructor(
    message?: DJS.Message,
    interaction?: DJS.CommandInteraction<DJS.CacheType>,
    args?: ArgsSchema
  ) {
    if (message) {
      this.message = message
      this.isMessage = true
      if (args) {
        this.args = new Map()
        args.args.forEach((arg, index) => {
          this.args.set(args.labels[index], arg)
        })
      }
    } else if (interaction) {
      this.message = interaction
      this.isMessage = false
      if (args?.labels) {
        this.args = new Map()
        args.labels.forEach((label) => {
          const thisInteraction =
            label === 'channel'
              ? interaction.options.getChannel(label)
              : interaction.options.getString(label)
          if (
            thisInteraction instanceof DJS.BaseGuildTextChannel &&
            thisInteraction.isText()
          ) {
            this.args.set(label, thisInteraction.id)
          }
        })
      }
    }
  }

  public async replyto(message: DJS.ReplyMessageOptions): Promise<void> {
    if (this.isMessage) {
      const botMessage = await this.message.reply(message)
      botMessage && this.setBotMessage(botMessage)
    } else {
      await this.message.reply({
        ...message,
        ephemeral: true
      })
    }
  }

  public async editReply(
    message: DJS.ReplyMessageOptions | string
  ): Promise<void> {
    if (this.message instanceof DJS.CommandInteraction) {
      await this.message.editReply(message)
    }
  }

  public async replyOrEdit(
    message: DJS.ReplyMessageOptions,
    deleteMsgn?: boolean
  ): Promise<void> {
    if (this.isMessage) {
      await this.message.reply(message)
      deleteMsgn && this.botMessage.delete()
    } else if (this.message instanceof DJS.CommandInteraction) {
      await this.message.editReply(message)
    }
  }

  public async sendOrEdit(message: DJS.ReplyMessageOptions): Promise<void> {
    if (this.isMessage && this.message.channel) {
      const msgn = await this.message.channel.send(message)
      await this.botMessage.delete()
      this.messageStatus = msgn
    } else if (this.message instanceof DJS.CommandInteraction) {
      await this.message.editReply(message)
    }
  }

  private setBotMessage(message: DJS.Message): void {
    this.botMessage = message
  }

  public getMessage(): DJS.Message | DJS.CommandInteraction<DJS.CacheType> {
    return this.message
  }

  public getBotMessage(): DJS.Message {
    return this.botMessage
  }

  public getMessageStatus(): DJS.Message {
    return this.messageStatus
  }

  public setArgs(key: string, value: string | DJS.GuildTextBasedChannel): void {
    if (!this.args) {
      this.args = new Map()
    }
    this.args.set(key, value)
  }

  public getArg(key: string): string | DJS.GuildTextBasedChannel {
    return this.args?.get(key) ?? ''
  }
}
