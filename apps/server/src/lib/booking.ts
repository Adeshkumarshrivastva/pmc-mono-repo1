import dayjs from './dayjs'
import type { DayOfWeek } from '../generated/prisma'
import { minutesToHHMM } from './date'

import { type Booking, type Expert, type Service, type Patient, type User, ServiceMode } from '../generated/prisma'

type BookingWithRelations = Booking & {
  expert: Expert & {
    user: User
  }
  patient: Patient & {
    user: User
  }
  service: Service
}

type BookingConfirmationProps = {
  booking: BookingWithRelations
}

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

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function getInPersonAddress({ booking }: BookingConfirmationProps) {
  if (booking.mode !== ServiceMode.IN_PERSON || !booking.inPersonLocation) {
    return null
  }

  const location = booking.inPersonLocation as Record<string, string>
  const address = location.address || ''
  const city = location.city || ''
  return `${address}${address && city ? ', ' : ''}${city}`
}

export function getVirtualMeetingLink({ booking }: BookingConfirmationProps) {
  if (booking.mode !== ServiceMode.VIRTUAL || !booking.virtualLocation) {
    return null
  }

  const location = booking.virtualLocation as Record<string, string>
  return location.meetingLink || null
}
