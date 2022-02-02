import DiscordJS, { Intents } from 'discord.js'
import dotenv from 'dotenv'
import { initializeWOK } from './utils/wokCommandsInit'
import path from 'path'
import { __prod__, __pwencription__ } from './utils/constants'

if (!__prod__) {
  dotenv.config()
}

const COMMANDS_DIR = path.join(__dirname, 'commands')
const MESSAGES_DIR = path.join(__dirname, 'messages.json')
const BOT_OWNER = process.env.OWNER

const main = async (): Promise<void> => {
  if (!__pwencription__) {
    throw new Error('You must define a master key!!!')
  }

  const client = new DiscordJS.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
  })

  client.on('guildCreate', async (guild) => {
    await guild.systemChannel?.send({
      content: "Thank's for adding me into your server"
    })
  })

  client.on('ready', () => {
    initializeWOK(
      client,
      COMMANDS_DIR,
      MESSAGES_DIR,
      process.env.MONGO_URI ?? '',
      BOT_OWNER
    )
    console.log('Bot is ready')
  })

  await client.login(process.env.TOKEN)
}

main().catch((err) => {
  console.log(err)
})
