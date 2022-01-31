/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { __prod__, __pwencription__ } from '../utils/constants'
import DJS from 'discord.js'
import { ICommand } from 'wokcommands'
import EncryptorDecryptor from '../utils/encryption'
import guildServersSchema from '../models/guild-servers'
// import argon2 from 'argon2'

export default {
  category: 'api key',
  description: 'Set your API key',
  permissions: ['ADMINISTRATOR'],
  minArgs: 1,
  expectedArgs: '<key>',
  slash: true,
  testOnly: __prod__,

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

    const enc = new EncryptorDecryptor()

    if (__pwencription__) {
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
    } else {
      return 'Problens with application, please contact the support'
    }
  }
} as ICommand
