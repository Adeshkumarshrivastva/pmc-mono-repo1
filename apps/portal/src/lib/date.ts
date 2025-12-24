import type { Dayjs } from 'dayjs'
import dayjs from './dayjs'

export const MINUTES_PER_HOUR = 60
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR
export const DEFAULT_TIMEZONE = dayjs.tz.guess() || 'Asia/Kolkata'

export const today = dayjs().tz(DEFAULT_TIMEZONE).toDate()

export function toDDMMYYYY(date: Date | Dayjs) {
  if (dayjs.isDayjs(date)) {
    return date.format('DD-MM-YYYY')
  } else {
    return dayjs(date).format('DD-MM-YYYY')
  }
}

export function toHHMMA(date: Date | Dayjs) {
  if (dayjs.isDayjs(date)) {
    return date.format('hh:mm A')
  } else {
    return dayjs(date).format('hh:mm A')
  }
}

export function utcMinutesToLocalMinutes(utcMinutes: number, timeZone: string = DEFAULT_TIMEZONE) {
  const utcTime = dayjs.utc().startOf('day').add(utcMinutes, 'minute')

  const localTime = utcTime.tz(timeZone)

  return localTime.hour() * MINUTES_PER_HOUR + localTime.minute()
}

export function localMinutesToUtcMinutes(minutes: number, timeZone: string = DEFAULT_TIMEZONE) {
  const localTime = dayjs().tz(timeZone).startOf('day').add(minutes, 'minute')
  const utcTime = localTime.utc()
  return utcTime.hour() * MINUTES_PER_HOUR + utcTime.minute()
}

export function utcDateToLocalDate(date: Date, timeZone: string = DEFAULT_TIMEZONE) {
  return dayjs.utc(date).tz(timeZone).toDate()
}

export function minutesToDate(minutes: number, baseDate: Date, timeZone: string = DEFAULT_TIMEZONE) {
  return dayjs.tz(baseDate, timeZone).startOf('day').add(minutes, 'minute').toDate()
}

export function dateToUtcMinutes(date: Date | string) {
  const dt = dayjs(date).utc()
  return dt.hour() * MINUTES_PER_HOUR + dt.minute()
}

export function formatDateTimeRange({
  startDateTime,
  endDateTime,
  dateFormat = 'dddd, MMMM D, YYYY',
}: {
  startDateTime: Date
  endDateTime: Date
  dateFormat?: string
}) {
  const localStartDateTime = dayjs(utcDateToLocalDate(startDateTime))
  const localEndDateTime = dayjs(utcDateToLocalDate(endDateTime))

  const dateStr = localStartDateTime.format(dateFormat)
  const startTimeStr = toHHMMA(localStartDateTime)
  const endTimeStr = toHHMMA(localEndDateTime)
  return `${startTimeStr} - ${endTimeStr}, ${dateStr}`
}
