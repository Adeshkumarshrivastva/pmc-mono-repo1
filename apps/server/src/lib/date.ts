import type { Dayjs } from 'dayjs'
import dayjs from './dayjs'

export const MINUTES_PER_HOUR = 60
export const DEFAULT_TIMEZONE = 'Asia/Calcutta'

export function dateToMinutes(date: Date | string): number {
  const dt = dayjs(date)
  return dt.hour() * MINUTES_PER_HOUR + dt.minute()
}

export function minutesToHHMM(minutes: number): string {
  return dayjs.duration(minutes, 'minutes').format('HH:mm')
}

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

export function formatDateTimeRange(
  { startDateTime, endDateTime }: { startDateTime: Date; endDateTime: Date },
  timeZone = DEFAULT_TIMEZONE,
) {
  const localStartDateTime = dayjs(startDateTime).tz(timeZone)
  const localEndDateTime = dayjs(endDateTime).tz(timeZone)

  const dateStr = localStartDateTime.format('dddd, MMMM D, YYYY')
  const startTimeStr = toHHMMA(localStartDateTime)
  const endTimeStr = toHHMMA(localEndDateTime)
  return `${startTimeStr} - ${endTimeStr}, ${dateStr}`
}
