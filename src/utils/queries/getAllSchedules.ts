import scheduleGuildSchema, { Schedules } from '../../models/schedule-guilds'

export default async (): Promise<Schedules[] | undefined> => {
  const query = await scheduleGuildSchema.find({})

  if (!query || query.length === 0) {
    return
  }

  return query
}
