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

export function toDDMMYYYY(date: Dayjs) {
  return dayjs(date).format('DD-MM-YYYY')
}
