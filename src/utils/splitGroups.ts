import { EmbedFieldData } from 'discord.js'
import { Server } from '../models/guild-servers'

export const createGroups = (arr: Server[], numGroups: number): Server[][] => {
  const perGroup = Math.ceil(arr.length / numGroups)
  const newGroup = new Array(numGroups)
    .fill('')
    .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup))
  return newGroup.filter((gp) => gp.length > 0)
}

export const createEmbedsGroups = (
  arr: EmbedFieldData[][],
  numGroups: number
): EmbedFieldData[][][] => {
  const perGroup = Math.ceil(arr.length / numGroups)
  const newGroup = new Array(numGroups)
    .fill('')
    .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup))
  return newGroup.filter((gp) => gp.length > 0)
}
