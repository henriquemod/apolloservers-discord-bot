import * as DJS from 'discord.js'

export class MessageController {
  private readonly message: DJS.Message | DJS.CommandInteraction<DJS.CacheType>
  private readonly isMessage: boolean
  private botMessage: DJS.Message
  private messageStatus: DJS.Message

  constructor(
    message?: DJS.Message,
    interaction?: DJS.CommandInteraction<DJS.CacheType>
  ) {
    if (message) {
      this.message = message
      this.isMessage = true
    } else if (interaction) {
      this.message = interaction
      this.isMessage = false
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

  public getBotMessage(): DJS.Message {
    return this.botMessage
  }

  public getMessageStatus(): DJS.Message {
    return this.messageStatus
  }
}
