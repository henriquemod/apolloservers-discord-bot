import * as mongoose from 'mongoose'
import { Schedules } from '../types/schedule'
const { Schema } = mongoose

const reqString = {
  type: String,
  required: true
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
