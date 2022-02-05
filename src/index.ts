import DiscordJS, { Intents } from 'discord.js'
// import dotenv from 'dotenv'
import { initializeWOK } from './utils/wokCommandsInit'
import path from 'path'
import { __pwencription__ } from './utils/constants'
import { logInit } from './config/log4jConfig'
import { C_PRIMARY } from './config/colors'

// if (!__prod__) {
//   dotenv.config()
// }

const log = logInit(['app', 'out']).getLogger('APP')

const COMMANDS_DIR = path.join(__dirname, 'commands')
const FEATURES_DIR = path.join(__dirname, 'features')
const MESSAGES_DIR = path.join(__dirname, 'messages.json')
const BOT_OWNER = process.env.OWNER ?? ''

const main = async (): Promise<void> => {
  if (!__pwencription__) {
    throw new Error('You must define a master key!!!')
  }

  const client = new DiscordJS.Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
  })

  client.on('ready', () => {
    const wok = initializeWOK({
      client,
      dir: COMMANDS_DIR,
      messagesDir: MESSAGES_DIR,
      featuresDir: FEATURES_DIR,
      mongoUri: process.env.MONGO_URI ?? '',
      owner: BOT_OWNER
    }).setColor(C_PRIMARY)

    // Ran when an exception occurs within a command
    wok.on(
      'commandException',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (command: { names: any[] }, message: any, error: any) => {
        log.error('Exception Error', {
          command,
          message,
          error
        })
      }
    )

    console.log('Bot is ready')
  })

  await client.login(process.env.TOKEN)
}

main().catch((err) => {
  log.error(err)
})
