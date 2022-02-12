import scheduleGuildSchema from '../../models/schedule-guilds'

interface Props {
  guildid: string
  serverid: string
}
export const deleteScheduleByServerId = async ({
  guildid,
  serverid
}: Props): Promise<boolean> => {
  try {
    await scheduleGuildSchema.findByIdAndUpdate(
      { _id: guildid },
      { $pull: { schedules: { serverid } } }
    )
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
