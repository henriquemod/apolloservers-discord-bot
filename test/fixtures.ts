import * as msgn from '../src/messages.json'
if (!msgn) {
  throw Error('No json messages!!!')
}
const dummyServer = (key: number) => ({
  key,
  name: 'valid_server_name',
  host: '1.1.1.1',
  port: 40444,
  type: 'csgo',
  description: 'valid_server_description',
  // eslint-disable-next-line no-new-object
  _id: new Object('621180ea81a27c9909164dbf' + key),
  id: '621180ea81a27c9909164dbf' + key
})

const buildServers = (length: number) => {
  const servers = []
  for (let count = 0; count < length; count++) {
    servers.push(dummyServer(count))
  }
  return servers
}

const validGuild = {
  _id: 'valid_guild_id',
  __v: 0,
  apiKey: 'encriptedApiKeu',
  servers: [],
  timezone: 'UTC',
  locale: 'en-US'
}

const validGuildWithOneServer = {
  ...validGuild,
  servers: [dummyServer(1)]
}

const validGuildWithMaxServers = {
  ...validGuild,
  servers: buildServers(25)
}
export { validGuild, validGuildWithOneServer, msgn, validGuildWithMaxServers }
