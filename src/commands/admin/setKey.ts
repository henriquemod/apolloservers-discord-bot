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

  callback: async ({ guild, interaction }) => {
    if (!guild) {
      return 'Please use this command within a server'
    }
    const apiKey = interaction.options.getString('key')

    if (!apiKey) {
      return 'Please inform an API key'
    }

    try {
      const enc = new EncryptorDecryptor()
      const encryptedApiKey = enc.encryptString(apiKey, __pwencription__)
      await guildServersSchema.findByIdAndUpdate(
        { _id: guild.id },
        {
          apiKey: encryptedApiKey
        },
        {
          upsert: true
        }
      )
      return 'Chave API adicionada com sucesso'
    } catch (error) {
      console.log(error)
      return 'Error adding a API key, contact support'
    }
  }
} as ICommand
