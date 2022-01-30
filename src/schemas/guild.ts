import mongoose from 'mongoose'
const { Schema } = mongoose

const GuildSchema = new Schema({
  guildId: { type: String, required: true },
  servers: [
    {
      name: { type: String, required: true },
      host: { type: String, required: true },
      port: { type: Number, required: true },
      type: { type: String, required: true },
      required: false
    }
  ]
})

const name = 'guild'

export default mongoose.models[name] || mongoose.model(name, GuildSchema, name)
