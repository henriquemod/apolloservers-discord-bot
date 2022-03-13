import { Types } from 'mongoose'

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
  schedules: Types.DocumentArray<Schedule>
}

export interface DjsScheduleProps {
  guildid: string
  serverid: string
  messageid: string
  channelid: string
}
