import * as DJS from 'discord.js'
import { initializeWOK, __pwencription__, loadSchedules } from './utils'
import * as path from 'path'
import log4jConfig from './config/log4jConfig'
import { C_PRIMARY } from './config/colors'
import * as msgns from './messages.json'
import { AppContext } from './lib/appContext'

if (msgns) {
  console.log('Messages loaded')
}
const log = log4jConfig(['app', 'out']).getLogger('APP')

const COMMANDS_DIR = path.join(__dirname, 'commands')
const FEATURES_DIR = path.join(__dirname, 'features')
const MESSAGES_DIR = path.join(__dirname, 'messages.json')
const BOT_OWNER = process.env.OWNER ?? ''

export const appContext = new AppContext()

const main = async (): Promise<void> => {
  if (!__pwencription__) {
    if (!process.env.TEST) throw new Error('You must define a master key!!!')
    return
  }
  appContext.setMasterkey(__pwencription__)

  const client = new DJS.Client({
    intents: [
      DJS.Intents.FLAGS.GUILDS,
      DJS.Intents.FLAGS.GUILD_MESSAGES,
      DJS.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
  })

  client.on('ready', async () => {
    const wok = initializeWOK({
      client,
      dir: COMMANDS_DIR,
      messagesDir: MESSAGES_DIR,
      featuresDir: FEATURES_DIR,
      mongoUri: process.env.MONGO_URI ?? '',
      owner: BOT_OWNER
    }).setColor(C_PRIMARY)

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

    await loadSchedules({ client, instance: wok })

    appContext.setInstance(wok)

    console.log('Bot is readys!')
  })

  await client.login(process.env.TOKEN)
}

main().catch((err) => {
  log.error(err)
})
