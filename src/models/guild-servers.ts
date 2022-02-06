import mongoose, { Types } from 'mongoose'
const { Schema } = mongoose

const reqString = {
  type: String,
  required: true
}

const reqNumber = {
  type: Number,
  required: true
}

export interface Server {
  key: number
  id: string
  name: string
  host: string
  port: number
  type: string
  description?: string
}

interface Guild {
  _id: string
  apiKey: string
  servers: Types.DocumentArray<Server>
}

const guildServersSchema = new Schema<Guild>({
  _id: reqString,
  apiKey: { type: String },
  servers: [
    {
      key: reqNumber,
      name: reqString,
      host: reqString,
      port: reqNumber,
      type: reqString,
      description: { type: String },
      required: false
    }
  ]
})

const name = 'guildservers'

export default mongoose.models[name] ||
  mongoose.model(name, guildServersSchema, name)
