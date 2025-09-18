import dayjs from './dayjs'
import type { DayOfWeek } from '../generated/prisma'
import { minutesToHHMM } from './date'

export const DAY_MAP: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

export type TimeRange = { start: number; end: number }
export type Slot = { startTime: number; displayTime: string }

export function getDatesInMonth(year: number, month: number) {
  const startDate = dayjs(`${year}-${month}-01`)
  const daysInMonth = startDate.daysInMonth()

  return Array.from({ length: daysInMonth }, (_, i) => startDate.add(i, 'day'))
}

export function generateDaySlots(daySchedule: TimeRange[], duration: number): Slot[] {
  const slots: Slot[] = []

  daySchedule.forEach((range) => {
    for (let time = range.start; time + duration <= range.end; time += duration) {
      slots.push({
        startTime: time,
        displayTime: minutesToHHMM(time),
      })
    }
  })

  return slots
}

export function isSlotOverlapping(slotA: TimeRange, slotB: TimeRange) {
  return slotA.start < slotB.end && slotA.end > slotB.start
}
