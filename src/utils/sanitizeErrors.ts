import { ICallbackObject } from 'wokcommands'
import { GetServerInfoQuery } from '../generated/graphql'

export const sanitizeErrors = (
  instance: ICallbackObject['instance'],
  guild: ICallbackObject['guild'],
  data?: GetServerInfoQuery['getServerInfo']
): string => {
  const errors = data?.errors ?? []
  let errorList = ''
  if (errors.length > 0) {
    for (const error of errors) {
      if (error.errorType === 'api-error') {
        errorList +=
          (instance.messageHandler.get(guild, 'API_KEY_ERROR') as string) + '\n'
      } else if (error.message) {
        errorList += error.message + '\n'
      }
    }
  }
  return errorList
}
