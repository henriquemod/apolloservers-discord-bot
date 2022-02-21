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
  servers: [
    {
      key: 1,
      name: 'valid_server_name',
      host: '1.1.1.1',
      port: 40444,
      type: 'csgo',
      description: 'valid_server_description',
      // eslint-disable-next-line no-new-object
      _id: new Object('621180ea81a27c9909164dbf'),
      id: '621180ea81a27c9909164dbf'
    }
  ]
}
export { validGuild, validGuildWithOneServer }
