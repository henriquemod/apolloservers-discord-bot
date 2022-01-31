/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { __prod__ } from '../../utils/constants'
import { ICommand } from 'wokcommands'

export default {
  category: 'Configuration',
  description: 'Set an status for Apollo Servers Bot',
  slash: true,
  testOnly: !__prod__,

  minArgs: 1,
  expectedArgs: '<status>',

  ownerOnly: true,

  callback: async ({ client, text }) => {
    client.user?.setPresence({
      status: 'online',
      activities: [
        {
          name: text
        }
      ]
    })

    return 'Status updated'
  }
} as ICommand
