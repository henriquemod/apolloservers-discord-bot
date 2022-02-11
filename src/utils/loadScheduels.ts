import getAllSchedules from './queries/getAllSchedules'
import * as DJS from 'discord.js'
import * as cron from 'node-cron'
import * as R from 'ramda'
import {
  UpdateServerProps,
  updateServerStatus
} from './status/updateServerStatus'
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
    const buildServers: UpdateServerProps[] = []
    for (const guild of schedules) {
      const guildid = guild._id
      for (const schedule of guild.schedules) {
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
              buildServers.push({
                guild,
                server,
                apikey: apiKey,
                instance,
                message
              })
            }
          }
        }
      }
    }

    cron.schedule('*/20 * * * * *', () => {
      Promise.allSettled(R.map(updateServerStatus, buildServers)).catch(
        (err) => {
          console.log(err)
        }
      )
    })
  }
}
