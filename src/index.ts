import DiscordJS, { Intents } from 'discord.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { initializeWOK } from './utils/wokCommandsInit'
import path from 'path'
// import GuildSchema from './schemas/guild'

dotenv.config()

const main = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGO_URI ?? '', {
    keepAlive: true
  })

  const client = new DiscordJS.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
  })

  client.on('ready', () => {
    initializeWOK(client, path.join(__dirname, 'commands'))
    console.log('Bot is ready')
  })

  // await new GuildSchema({
  //   guildId: 'asd'
  // }).save()

  await client.login(process.env.TOKEN)
}

main().catch((err) => {
  console.log(err)
})
