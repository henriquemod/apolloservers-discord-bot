import * as DJS from 'discord.js'

export interface Messages {
  replyto(message: DJS.ReplyMessageOptions): Promise<void>
  editReply(message: DJS.ReplyMessageOptions | string): Promise<void>
  replyOrEdit(
    message: DJS.ReplyMessageOptions,
    deleteMsgn?: boolean
  ): Promise<void>
  sendOrEdit(message: DJS.ReplyMessageOptions): Promise<void>
  getMessage(): DJS.Message | DJS.CommandInteraction<DJS.CacheType>
  getBotMessage(): DJS.Message
  getMessageStatus(): DJS.Message
  setArgs(key: string, value: string | DJS.GuildTextBasedChannel): void
  getArg(key: string): string | DJS.GuildTextBasedChannel
}
