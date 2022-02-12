import scheduleGuildSchema from '../../models/schedule-guilds'

interface Props {
  guildid: string
  channelid: string
}
export const deleteScheduleByChannelId = async ({
  guildid,
  channelid
}: Props): Promise<void> => {
  try {
    await scheduleGuildSchema.findByIdAndUpdate(
      { _id: guildid },
      { $pull: { schedules: { channelid } } }
    )
  } catch (error) {
    console.log(error)
  }
}
