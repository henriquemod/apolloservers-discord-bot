/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { __prod__ } from '../utils/constants'
import { ICommand } from 'wokcommands'

export default {
  category: 'testing',
  description: 'replies with pon',
  slash: 'both',
  testOnly: __prod__,

  callback: async () => {
    return 'Pong'
  }
} as ICommand
