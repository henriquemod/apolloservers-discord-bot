import scheduleGuildSchema, { Schedule } from '../../models/schedule-guilds'

interface Props {
  guildid: string
  serverid: string
  messageid: string
  channelid: string
}
export const addSchedule = async ({
  guildid,
  serverid,
  messageid,
  channelid
}: Props): Promise<boolean> => {
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
