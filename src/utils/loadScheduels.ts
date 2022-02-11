import getAllSchedules from './queries/getAllSchedules'
import * as DJS from 'discord.js'
import * as cron from 'node-cron'
import { updateServerStatus } from './status/updateServerStatus'
import { findServerById } from './queries/findServerById'
import guildServersSchema from '../models/guild-servers'
import EncryptorDecryptor from './encryption'
import { __pwencription__ } from './constants'
import WOKCommands from 'wokcommands'

interface Props {
  client: DJS.Client<boolean>
  instance: WOKCommands
}

export const loadSchedules = async ({
  client,
  instance
}: Props): Promise<void> => {
  const schedules = await getAllSchedules()

  if (schedules) {
    schedules.forEach((guild) => {
      const guildid = guild._id
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      guild.schedules.forEach(async (schedule) => {
        const { serverid, channelid, messageid } = schedule
        const guild = client.guilds.cache.get(guildid)
        if (guild) {
          const server = await findServerById({ guild: guild, serverid })
          const find = await guildServersSchema.findById({ _id: guild.id })

          const channel = guild.channels.cache.get(channelid)

          if (find && server && channel?.isText()) {
            const apiKey = new EncryptorDecryptor().decryptString(
              find.apiKey,
              __pwencription__ ?? ''
            )

            const message = await channel.messages.fetch(messageid)
            if (message) {
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              cron.schedule('*/20 * * * * *', async () => {
                await updateServerStatus({
                  guild,
                  server,
                  apikey: apiKey,
                  instance,
                  message
                })
              })
            }
          }
        }
      })
    })
  }
}
