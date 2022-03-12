import * as DJS from 'discord.js'
import guildServersSchema from '../../src/models/guild-servers'
import { msgn } from '../fixtures'
// import guildServersSchema from '../../src/models/guild-servers'
import { ICallbackObject } from 'wokcommands'
import addScheduleCommand from '../../src/commands/admin/CRUD-Schedule/addSchedule'
import deleteScheduleCommand from '../../src/commands/admin/CRUD-Schedule/deleteSchedule'
import { _testContext_ } from '../../src/utils'
import { validGuild, validGuildWithOneServer } from '../fixtures'
// import * as valid from '../../src/utils/discord/validations'
// import ChannelController from '../../src/controllers/channel-controller'

describe('Add schedule related teste', () => {
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

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Please use this command within a server')
    }
  })

  it('should return channel needed if none were provided within a legacy command', async () => {
    const message = {
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      args: ['valid_server_id', ''],
      message,
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'fake_guild_id'
      }
    } as unknown as ICallbackObject

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'CHANNEL_NEEDED') {
          return msgn.CHANNEL_NEEDED.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Your need to provide a channel')
    }
  })

  it('should return channel needed if none were provided within a slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue(''),
        getChannel: jest.fn().mockReturnValue(undefined)
      },
      reply: jest.fn()
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

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'CHANNEL_NEEDED') {
          return msgn.CHANNEL_NEEDED.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Your need to provide a channel')
    }
  })

  it('should return invalid channel if ivalid channel were provided within legacy command', async () => {
    const message = {
      content: '!addSchedule fake_channel_id fake_server_id',
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      message,
      args: ['valid_server_id', 'invalid_channel_id'],
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'fake_guild_id'
      }
    } as unknown as ICallbackObject

    _testContext_?.setIsValidTextChannel(false)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'INVALID_CHANNEL') {
          return msgn.INVALID_CHANNEL.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Please provide a valid channel')
    }
  })

  it('should return invalid channel if ivalid channel were provided within slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue('valid_server_id'),
        getChannel: jest.fn().mockReturnValue('invalid_channel_id')
      },
      reply: jest.fn()
    } as unknown as DJS.CommandInteraction

    const callbackOnj = {
      prefix: '/',
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

    _testContext_?.setIsValidTextChannel(false)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'INVALID_CHANNEL') {
          return msgn.INVALID_CHANNEL.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Please provide a valid channel')
    }
  })

  it('should return no server configured if client has none added when using legacy command', async () => {
    const message = {
      content: '!addSchedule fake_channel_id fake_server_id',
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      message,
      args: ['valid_server_id', 'invalid_channel_id'],
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'fake_guild_id'
      }
    } as unknown as ICallbackObject

    _testContext_?.setIsValidTextChannel(true)
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(undefined)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'ERROR_SERVER_NOT_CONFIGURED') {
          return msgn.ERROR_SERVER_NOT_CONFIGURED.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('This discord server is not configured')
    }
  })

  it('should return no server configured if client has none added when using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue('valid_server_id'),
        getChannel: jest.fn().mockReturnValue('invalid_channel_id')
      },
      reply: jest.fn()
    } as unknown as DJS.CommandInteraction

    const callbackOnj = {
      prefix: '/',
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

    _testContext_?.setIsValidTextChannel(true)
    // guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuildWithOneServer)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'ERROR_SERVER_NOT_CONFIGURED') {
          return msgn.ERROR_SERVER_NOT_CONFIGURED.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('This discord server is not configured')
    }
  })

  it('should return no gameserver if ds servers has none added when using legacy command', async () => {
    const message = {
      content: '!addSchedule fake_channel_id',
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      message,
      args: [null, 'valid_channel_id'],
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'valid_guild_id'
      }
    } as unknown as ICallbackObject

    _testContext_?.setIsValidTextChannel(true)
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'ERROR_NONE_GAMESERVER') {
          return msgn.ERROR_NONE_GAMESERVER.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe(
        'There is no server added in this discord server 😥'
      )
    }
  })

  it('should return no gameserver if ds servers has none added when using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue(null),
        getChannel: jest.fn().mockReturnValue('invalid_channel_id')
      },
      reply: jest.fn()
    } as unknown as DJS.CommandInteraction

    const callbackOnj = {
      prefix: '/',
      interaction,
      args: [null, 'valid_channel_id'],
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'valid_guild_id'
      }
    } as unknown as ICallbackObject

    _testContext_?.setIsValidTextChannel(true)
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'ERROR_NONE_GAMESERVER') {
          return msgn.ERROR_NONE_GAMESERVER.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe(
        'There is no server added in this discord server 😥'
      )
    }
  })

  it('should return server id needed if none provided when using legacy command', async () => {
    const message = {
      content: '!addSchedule fake_channel_id',
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      message,
      args: [null, 'valid_channel_id'],
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'valid_guild_id'
      }
    } as unknown as ICallbackObject

    _testContext_?.setIsValidTextChannel(true)
    guildServersSchema.findById = jest
      .fn()
      .mockResolvedValueOnce(validGuildWithOneServer)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'PROVIDE_SERVER_ID') {
          return msgn.PROVIDE_SERVER_ID.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Please provide a server id')
    }
  })

  it('should return server id needed if none provided when using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue(null),
        getChannel: jest.fn().mockReturnValue('invalid_channel_id')
      },
      reply: jest.fn()
    } as unknown as DJS.CommandInteraction

    const callbackOnj = {
      prefix: '/',
      interaction,
      args: [null, 'valid_channel_id'],
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'valid_guild_id'
      }
    } as unknown as ICallbackObject

    _testContext_?.setIsValidTextChannel(true)
    guildServersSchema.findById = jest
      .fn()
      .mockResolvedValueOnce(validGuildWithOneServer)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'PROVIDE_SERVER_ID') {
          return msgn.PROVIDE_SERVER_ID.english
        }
      })

    if (addScheduleCommand.callback) {
      const callback = await addScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Please provide a server id')
    }
  })
})

describe('Delete schedule related teste', () => {
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

    if (deleteScheduleCommand.callback) {
      const callback = await deleteScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('Please use this command within a server')
    }
  })

  it('should return server not configured if none ds server is present in database using legacy command', async () => {
    const message = {
      content: '!deleteSchedule fake_channel_id',
      channel: {
        send: jest.fn()
      }
    } as unknown as DJS.Message

    const callbackOnj = {
      prefix: '/',
      message,
      args: ['valid_channel_id'],
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: {
        id: 'valid_guild_id'
      }
    } as unknown as ICallbackObject

    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(null)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'ERROR_SERVER_NOT_CONFIGURED') {
          return msgn.ERROR_SERVER_NOT_CONFIGURED.english
        }
      })

    if (deleteScheduleCommand.callback) {
      const callback = await deleteScheduleCommand.callback(callbackOnj)
      expect(callback).toBe('This discord server is not configured')
    }
  })
})
