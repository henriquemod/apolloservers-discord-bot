import * as mongoose from 'mongoose'
const { Schema } = mongoose

const reqString = {
  type: String,
  required: true
}

type frequency = 'EVERYMINUTE' | 'EVERY15MIN' | 'EVERY30MIN'

export interface Schedule {
  serverid: string
  messageid: string
  channelid: string
  freq: frequency
}

export interface Schedules {
  _id: string
  guildid: string
  schedules: mongoose.Types.DocumentArray<Schedule>
}

const scheduleGuildSchema = new Schema<Schedules>({
  _id: reqString,
  guildid: reqString,
  schedules: [
    {
      serverid: reqString,
      messageid: reqString,
      channelid: reqString,
      freq: {
        type: String,
        enum: ['EVERYMINUTE', 'EVERY15MIN', 'EVERY30MIN'],
        required: true
      }
    }
  ]
})

const name = 'schedule-guilds'

export default mongoose.models[name] ||
  mongoose.model(name, scheduleGuildSchema, name)
