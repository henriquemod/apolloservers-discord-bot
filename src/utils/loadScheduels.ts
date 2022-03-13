import * as DJS from 'discord.js'
import WOKCommands from 'wokcommands'
import guildServersSchema from '../models/guild-servers'
import { deleteScheduleByMessageId } from './queries/deleteScheduleByMessageId'
import { findServerById } from './queries/findServerById'
import getAllSchedules from './queries/getAllSchedules'
import { UpdateServerProps } from './status/updateServerStatus'
import { deleteScheduleByChannelId } from './queries/deleteScheduleByChannelId'
import { EncryptorDecryptor, __pwencription__ } from '.'

const INCREMENTAL = 3000

interface Props {
  client: DJS.Client<boolean>
  instance: WOKCommands
  cron: (options: UpdateServerProps) => void
}

export const loadSchedules = async ({
  client,
  instance,
  cron
}: Props): Promise<void> => {
  const schedules = await getAllSchedules()
  if (schedules) {
    let time = 0
    for (const guild of schedules) {
      const guildid = guild._id
      for (const schedule of guild.schedules) {
        const { serverid, channelid, messageid } = schedule
        const guild = client.guilds.cache.get(guildid)
        if (!guild) {
          await guildServersSchema.deleteOne({ _id: guildid })
        } else {
          const server = await findServerById({ guild: guild, serverid })
          const find = await guildServersSchema.findById({ _id: guild.id })
          const channel = guild.channels.cache.get(channelid)
          if (!channel) {
            await deleteScheduleByChannelId({ guildid, channelid })
          } else {
            if (find && server && channel?.isText()) {
              const apiKey = new EncryptorDecryptor().decryptString(
                find.apiKey,
                __pwencription__ ?? ''
              )
              const loadMessage = async (): Promise<
                DJS.Message | undefined
              > => {
                try {
                  return await channel.messages.fetch(messageid)
                } catch (error) {}
              }
              const message = await loadMessage()
              if (!message) {
                await deleteScheduleByMessageId({
                  guildid: guildid,
                  messageid: messageid
                })
              } else {
                setTimeout(() => {
                  cron({
                    guild,
                    server,
                    apikey: apiKey,
                    instance,
                    message,
                    channelid: channel.id
                  })
                }, time)
                time += INCREMENTAL
              }
            }
          }
        }
      }
    }
  }
}
