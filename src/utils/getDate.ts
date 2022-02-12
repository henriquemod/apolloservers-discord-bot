import * as tz from 'countries-and-timezones'
interface Props {
  timezone?: string
  locale?: string
}

const DEFAULT_TIMEZONE = 'UTC'
const DEFAULT_LOCALE = 'en-US'

export default ({ timezone, locale }: Props): string => {
  const guildTz = tz.getTimezone(timezone ?? DEFAULT_TIMEZONE)
  locale = locale ?? DEFAULT_LOCALE
  return new Date(Date.now()).toLocaleDateString(locale, {
    timeZone: guildTz ? guildTz.name : DEFAULT_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}
