import * as DJS from 'discord.js'
import guildServersSchema from '../../models/guild-servers'
// import { QueryResult } from '../../types/queryResults'
import { ServerProps } from '../../types/server'

interface Props {
  guild: DJS.Guild
  serverid: string
  embedMessage?: DJS.Message
}

export const findServerById = async ({
  guild,
  serverid
}: Props): Promise<ServerProps | undefined> => {
  const query = await guildServersSchema.findOne(
    {
      _id: guild.id
    },
    { servers: { $elemMatch: { _id: serverid } } }
  )

  /**
   * NOTE - Check if there is no server added
   *        shoudnt be a problem since if bot get here
   *        means that already have some server added,
   *        but just to be sure
   */
  if (!query || query.servers.length === 0) {
    return
  }

  const serverSelected = query.servers[0] as ServerProps

  if (!serverSelected) {
    return
  }

  return serverSelected
}
