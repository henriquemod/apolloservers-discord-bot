import { ServerProps } from '../types/server'

export const createGroups = (
  arr: ServerProps[],
  numGroups: number
): ServerProps[][] => {
  const perGroup = Math.ceil(arr.length / numGroups)
  const newGroup = new Array(numGroups)
    .fill('')
    .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup))
  return newGroup.filter((gp) => gp.length > 0)
}
