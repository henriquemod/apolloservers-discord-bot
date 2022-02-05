import { Client, MessageEmbed } from 'discord.js'
import { C_PRIMARY } from '../config/colors'

export default (client: Client): void => {
  client.on('guildCreate', async (guild) => {
    const embed = new MessageEmbed()
      .setTitle("Thank's for adding me into your server")
      .setDescription(
        "I'm a bot that can help you show your gameserver's stats, use !help to see all commands"
      )
      .setColor(C_PRIMARY)
      .setFooter({ text: 'Made with ❤️ by @𝐇𝐞𝐧𝐫𝐢𝐪𝐮𝐞#7111' })
      .setImage(
        'https://pa1.narvii.com/6669/4d6b8ffa1b441a68a33ae97a548dcb787d97ff97_hq.gif'
      )
    await guild.systemChannel?.send({
      embeds: [embed]
    })
  })
}

export const config = {
  displayName: 'Guild Create',
  dbName: 'GUILD_CREATED'
}
