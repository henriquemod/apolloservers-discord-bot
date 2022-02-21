import * as DJS from 'discord.js'
import { ICallbackObject, ICommand } from 'wokcommands'
import status from '../src/commands/status'
import guildServersSchema from '../src/models/guild-servers'
import * as msgns from '../src/messages.json'
import { validGuild } from './fixtures'

describe('testing', () => {
  let serverStatus: ICommand
  const message = {
    channel: {
      send: jest.fn()
    }
  } as unknown as DJS.Message

  beforeAll(() => {
    serverStatus = status
  })

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

    if (serverStatus.callback) {
      const callback = await serverStatus.callback(callbackOnj)
      expect(callback).toBe('Please use this command within a server')
    }
  })

  it('should return server not configured if guild were not present in database', async () => {
    const callbackOnj = {
      prefix: '/',
      message,
      command: 'status',
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
      .mockReturnValueOnce(msgns.ERROR_SERVER_NOT_CONFIGURED.english)

    if (serverStatus.callback) {
      const callback = await serverStatus.callback(callbackOnj)
      expect(callback).toBe('This discord server is not configured')
    }
  })

  it('should return no servers add if guild is in database but not added any server', async () => {
    const callbackOnj = {
      prefix: '/',
      message,
      command: 'status',
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'fake_guild_id'
      }
    } as unknown as ICallbackObject

    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)
    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockReturnValueOnce(msgns.ERROR_NONE_GAMESERVER.english)

    if (serverStatus.callback) {
      const callback = await serverStatus.callback(callbackOnj)
      expect(callback).toBe(
        'There is no server added in this discord server 😥'
      )
    }
  })
})
