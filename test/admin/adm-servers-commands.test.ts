import { CommandInteraction } from 'discord.js'
import guildServersSchema from '../../src/models/guild-servers'
import { ICallbackObject } from 'wokcommands'
import addServerCommand from '../../src/commands/admin/CRUD-Servers/addServer'
import deleteServerCommand from '../../src/commands/admin/CRUD-Servers/deleteServer'
import { msgn, validGuild, validGuildWithMaxServers } from '../fixtures'
import { _testContext_ } from '../../src/utils'

describe('AddServer related tests', () => {
  it('Should return error if no guild', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue('valid_key')
      }
    } as unknown as CommandInteraction

    const callbackOnj = {
      prefix: '/',
      args: [],
      interaction,
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: undefined
    } as unknown as ICallbackObject

    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(undefined)

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toBe('Please use this command within a server')
    }
  })

  it('should return when no server configured if client has none added using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'valid_server_name'
          if (command === 'host') return 'valid_host'
          if (command === 'port') return 'valid_port'
          if (command === 'type') return 'valid_type'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(undefined)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'ERROR_SERVER_NOT_CONFIGURED') {
          return msgn.ERROR_SERVER_NOT_CONFIGURED.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toBe('This discord server is not configured')
    }
  })

  it('should return error when using wrong port using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'valid_server_name'
          if (command === 'host') return '0.0.0.0'
          if (command === 'port') return '999999'
          if (command === 'type') return 'csgo'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'INVALID_SERVER_PORT') {
          return msgn.INVALID_SERVER_PORT.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toBe('Please inform a correct value for server port')
    }
  })

  it('should return error when using wrong host using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'valid_server_name'
          if (command === 'host') return 'invalid_host'
          if (command === 'port') return '27015'
          if (command === 'type') return 'csgo'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'INVALID_SERVER_HOST') {
          return msgn.INVALID_SERVER_HOST.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toBe(
        'Please inform a valid server host, it has to be an domain or a IP address'
      )
    }
  })

  it('should return error when using short host name using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'a'
          if (command === 'host') return '0.0.0.0'
          if (command === 'port') return '27015'
          if (command === 'type') return 'csgo'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'INVALID_SERVER_NAME') {
          return msgn.INVALID_SERVER_NAME.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toBe(
        'Please inform the name you want to identify this server'
      )
    }
  })

  it('should return error when using wrong server type using slash command', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'valid_server_name'
          if (command === 'host') return '0.0.0.0'
          if (command === 'port') return '27015'
          if (command === 'type') return 'invalid_server_type'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'INVALID_SERVER_TYPE') {
          return msgn.INVALID_SERVER_TYPE.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toContain(
        'Please inform your server type, get list of types'
      )
    }
  })

  it('should return error when max servers reached', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'valid_server_name'
          if (command === 'host') return '0.0.0.0'
          if (command === 'port') return '27015'
          if (command === 'type') return 'invalid_server_type'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest
      .fn()
      .mockResolvedValueOnce(validGuildWithMaxServers)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'MAX_SERVERS_REACHED') {
          return msgn.MAX_SERVERS_REACHED.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toContain('Max numbers of servers reached')
    }
  })

  it('should return an error when system couldnt add server to database', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'valid_server_name'
          if (command === 'host') return '0.0.0.0'
          if (command === 'port') return '27015'
          if (command === 'type') return 'csgo'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    guildServersSchema.findByIdAndUpdate = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error()
      })

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'ERROR_ADD_SERVER') {
          return msgn.ERROR_ADD_SERVER.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toBe(
        'An errour occoured, verify if parametes were correct, if problem persists please contact the developer'
      )
    }
  })

  it('should return an success when server is added to database', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockImplementation((command) => {
          if (command === 'name') return 'valid_server_name'
          if (command === 'host') return '0.0.0.0'
          if (command === 'port') return '27015'
          if (command === 'type') return 'csgo'
        })
      },
      reply: jest.fn()
    } as unknown as CommandInteraction

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
    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(validGuild)

    jest
      .spyOn(callbackOnj.instance.messageHandler, 'get')
      .mockImplementation((_, MESSAGE_TAG) => {
        if (MESSAGE_TAG === 'SERVER_ADD_SUCCESS') {
          return msgn.SERVER_ADD_SUCCESS.english
        }
      })

    if (addServerCommand.callback) {
      const callback = await addServerCommand.callback(callbackOnj)
      expect(callback).toContain('was successfully added!')
    }
  })
})

describe('DeleteServer related tests', () => {
  it('Should return error if no guild', async () => {
    const interaction = {
      options: {
        getString: jest.fn().mockReturnValue('valid_key')
      }
    } as unknown as CommandInteraction

    const callbackOnj = {
      prefix: '/',
      args: [],
      interaction,
      instance: {
        messageHandler: {
          get: jest.fn()
        }
      },
      guild: undefined
    } as unknown as ICallbackObject

    guildServersSchema.findById = jest.fn().mockResolvedValueOnce(undefined)

    if (deleteServerCommand.callback) {
      const callback = await deleteServerCommand.callback(callbackOnj)
      expect(callback).toBe('Please use this command within a server')
    }
  })
})
