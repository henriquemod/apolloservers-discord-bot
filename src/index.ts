import DiscordJS, { Intents } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()

const main = async (): Promise<void> => {
  const client = new DiscordJS.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
  })

  client.on('ready', () => {
    console.log('Bot is ready')
  })

  client.on('messageCreate', async (message) => {
    if (message.content === 'ping') {
      await message.reply({
        content: 'Pong!!!'
      })
    }
  })

  await client.login(process.env.TOKEN)
}

main().catch((err) => {
  console.log(err)
})
