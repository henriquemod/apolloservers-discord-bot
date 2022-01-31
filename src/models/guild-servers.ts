import mongoose from 'mongoose'
const { Schema } = mongoose

const reqString = {
  type: String,
  required: true
}

const reqNumber = {
  type: Number,
  required: true
}

const guildServersSchema = new Schema({
  _id: reqString,
  apiKey: { type: String },
  servers: [
    {
      name: reqString,
      host: reqString,
      port: reqNumber,
      type: reqString,
      required: false
    }
  ]
})

const name = 'guildservers'

export default mongoose.models[name] ||
  mongoose.model(name, guildServersSchema, name)
