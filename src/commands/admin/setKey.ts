import { __prod__, __pwencription__ } from '../../utils/constants'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import EncryptorDecryptor from '../../utils/encryption'
import guildServersSchema from '../../models/guild-servers'

export default {
  category: 'Admin Panel',
  description: 'Set your API key',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  expectedArgs: '<key>',
  slash: true,
  testOnly: !__prod__,

  options: [
    {
      name: 'key',
      description: 'Inform your API key',
      required: true,
      type: DJS.Constants.ApplicationCommandOptionTypes.STRING
    }
  ],

  callback: async ({ guild, interaction, instance }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }
    const apiKey = interaction.options.getString('key')

    if (!apiKey) {
      return instance.messageHandler.get(guild, 'API_NEEDED')
    }

    try {
      const enc = new EncryptorDecryptor()
      const encryptedApiKey = enc.encryptString(apiKey, __pwencription__ ?? '')
      await guildServersSchema.findByIdAndUpdate(
        { _id: guild.id },
        {
          apiKey: encryptedApiKey
        },
        {
          upsert: true
        }
      )
      return instance.messageHandler.get(guild, 'API_ADDED')
    } catch (error) {
      return instance.messageHandler.get(guild, 'API_ADD_ERROR')
    }
  }
} as ICommand
