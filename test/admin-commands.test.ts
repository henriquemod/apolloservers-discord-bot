import * as DJS from 'discord.js'
import * as msgns from '../src/messages.json'
import guildServersSchema from '../src/models/guild-servers'
import { ICallbackObject } from 'wokcommands'
import setKeyCommand from '../src/commands/admin/CRUD-Guild/setKey'
import setLocaleCommand from '../src/commands/admin/CRUD-Guild/setLocale'

describe('Guild related', () => {
  // Key Tests
  it('should return warning when used outsite of a discord guild server', async () => {
    const message = {
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      args: [],
      message
    } as unknown as ICallbackObject

    if (setKeyCommand.callback) {
      const callback = await setKeyCommand.callback(callbackOnj)
      expect(callback).toBe('Please use this command within a server')
    }
  })

  test('Should return key needed if none provided', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue(undefined)
      }
    } as unknown as DJS.CommandInteraction

    const callbackOnj = {
      prefix: '/',
      args: [],
      interaction,
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'fake_guild_id'
      }
    } as unknown as ICallbackObject

    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(undefined)
    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockReturnValueOnce(msgns.API_NEEDED.english)
    if (setKeyCommand.callback) {
      const callback = await setKeyCommand.callback(callbackOnj)
      expect(callback).toBe('Please add you API key')
    }
  })

  test('Should return key added if provided', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue('valid_key')
      }
    } as unknown as DJS.CommandInteraction

    const callbackOnj = {
      prefix: '/',
      args: [],
      interaction,
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'fake_guild_id'
      }
    } as unknown as ICallbackObject

    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(undefined)
    guildServersSchema.findByIdAndUpdate = jest.fn().mockImplementation(() => {
      return {
        exec: jest.fn()
      }
    })
    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockReturnValueOnce(msgns.API_ADDED.english)

    if (setKeyCommand.callback) {
      const callback = await setKeyCommand.callback(callbackOnj)
      expect(callback).toBe('API key added')
    }
  })
  // Locale tests
  it('should return warning when setLocale is used outsite of a discord guild server', async () => {
    const message = {
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      args: [],
      message
    } as unknown as ICallbackObject

    if (setLocaleCommand.callback) {
      const callback = await setLocaleCommand.callback(callbackOnj)
      expect(callback).toBe('Please use this command within a server')
    }
  })

  test('Should return locale needed if none were provided', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue(undefined)
      }
    } as unknown as DJS.CommandInteraction

    const callbackOnj = {
      prefix: '/',
      args: [],
      interaction,
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'fake_guild_id'
      }
    } as unknown as ICallbackObject

    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(undefined)
    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockReturnValueOnce(msgns.LOCALE_NEEDED.english)
    if (setLocaleCommand.callback) {
      const callback = await setLocaleCommand.callback(callbackOnj)
      expect(callback).toBe('Please provide a locale')
    }
  })
})
