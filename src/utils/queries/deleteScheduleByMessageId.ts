import scheduleGuildSchema from '../../models/schedule-guilds'

interface Props {
  guildid: string
  messageid: string
}
export const deleteScheduleByMessageId = async ({
  guildid,
  messageid
}: Props): Promise<void> => {
  try {
    await scheduleGuildSchema.findByIdAndUpdate(
      { _id: guildid },
      { $pull: { schedules: { messageid: messageid } } }
    )
  } catch (error) {
    console.log(error)
  }
}
