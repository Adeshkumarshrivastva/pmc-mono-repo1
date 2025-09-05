import type { Dayjs } from 'dayjs'
import dayjs from './dayjs'

export const today = dayjs().toDate()

export function toDDMMYYYY(date: Date | Dayjs) {
  if (dayjs.isDayjs(date)) {
    return date.format('DD-MM-YYYY')
  } else {
    return dayjs(date).format('DD-MM-YYYY')
  }
}

export function minutesToHHMMA(minutes: number): string {
  return dayjs().utc().startOf('day').add(minutes, 'minute').tz('Asia/Kolkata').format('hh:mm A')
}
