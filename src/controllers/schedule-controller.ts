import { loadSchedules, UpdateServerProps, updateServerStatus } from '../utils'
import * as DJS from 'discord.js'
import WOKCommands from 'wokcommands'
import * as cron from 'node-cron'
import { DjsScheduleProps, Schedule } from '../types/schedule'
import scheduleGuildSchema from '../models/schedule-guilds'

export class ScheduleController {
  private readonly client: DJS.Client<boolean>
  private readonly instance: WOKCommands

  constructor(client: DJS.Client<boolean>, instance: WOKCommands) {
    this.client = client
    this.instance = instance
  }

  public async loadSchedule(): Promise<void> {
    await loadSchedules({
      client: this.client,
      instance: this.instance,
      cron: this.createCron
    })
  }

  public createCron = async (server: UpdateServerProps): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    cron.schedule('*/30 * * * * *', async () => {
      await updateServerStatus(server)
    })
  }

  public addSchedule = async ({
    guildid,
    serverid,
    messageid,
    channelid
  }: DjsScheduleProps): Promise<boolean> => {
    const insert: Schedule = {
      serverid,
      messageid,
      channelid,
      freq: 'EVERYMINUTE'
    }

    try {
      await scheduleGuildSchema.findByIdAndUpdate(
        { _id: guildid },
        {
          $push: {
            schedules: insert
          }
        },
        {
          upsert: true
        }
      )
      return true
    } catch (error) {
      console.log(error)

      return false
    }
  }
}
