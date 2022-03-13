import { Schedule } from '../../types/schedule'
import scheduleGuildSchema from '../../models/schedule-guilds'

interface Props {
  guildid: string
  serverid: string
}

export const findScheduleServerId = async ({
  guildid,
  serverid
}: Props): Promise<Schedule | undefined> => {
  const query = await scheduleGuildSchema.findOne(
    {
      _id: guildid
    },
    { schedules: { $elemMatch: { serverid } } }
  )

  if (!query || query.schedules.length === 0) {
    return
  }

  const serverSelected = query.schedules[0] as Schedule

  return serverSelected
}
