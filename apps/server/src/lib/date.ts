import type { Dayjs } from 'dayjs'
import dayjs from './dayjs'

export const MINUTES_PER_HOUR = 60

export function dateToMinutes(date: Date | string): number {
  const dt = dayjs(date)
  return dt.hour() * MINUTES_PER_HOUR + dt.minute()
}

export function minutesToHHMM(minutes: number): string {
  return dayjs.duration(minutes, 'minutes').format('HH:mm')
}

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

export function formatDateTimeRange({ startDateTime, endDateTime }: { startDateTime: Date; endDateTime: Date }) {
  const localStartDateTime = dayjs(utcDateToLocalDate(startDateTime))
  const localEndDateTime = dayjs(utcDateToLocalDate(endDateTime))

  const dateStr = localStartDateTime.format('dddd, MMMM D, YYYY')
  const startTimeStr = toHHMMA(localStartDateTime)
  const endTimeStr = toHHMMA(localEndDateTime)
  return `${startTimeStr} - ${endTimeStr}, ${dateStr}`
}
