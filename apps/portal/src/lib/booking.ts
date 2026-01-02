import type { InferResponseType } from 'hono'
import type { HonoClient } from './hono-client'
import { MINUTES_PER_DAY, minutesToDate, toHHMMA } from './date'
import dayjs from './dayjs'

export type BookingMode =
  | { type: 'select_slot' }
  | { type: 'verify_identity' }
  | { type: 'fill_prebooking_info'; phoneNumber: string }
  | { type: 'payment' }

export const BOOKING_LOCATION = ['VIRTUAL', 'IN_PERSON'] as const
export type BookingLocation = (typeof BOOKING_LOCATION)[number]

export type MonthlyAvailableSlots = InferResponseType<
  HonoClient['server']['experts'][':expertSlug']['monthly-available-slots'][':serviceSlug']['$get'],
  200
>

export const DATE_FORMAT = 'DD-MM-YYYY'

export const CURRENCY_CONFIG: Record<string, { symbol: string }> = {
  INR: { symbol: '₹' },
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
} as const

export type Booking = InferResponseType<HonoClient['server']['experts']['bookings']['$get'], 200>['bookings'][number]

export const BOOKING_PERIODS = ['upcoming', 'past'] as const
export type BookingPeriod = (typeof BOOKING_PERIODS)[number]

// Time slot configuration
export const SLOT_INTERVAL_MINUTES = 15

// Generate time options for dropdowns (00:00 AM - 11:45 PM in 15-minute intervals)
export const TIME_OPTIONS: { value: number; label: string }[] = (() => {
  const options: { value: number; label: string }[] = []
  for (let m = 0; m < MINUTES_PER_DAY; m += SLOT_INTERVAL_MINUTES) {
    options.push({ value: m, label: toHHMMA(minutesToDate(m, dayjs().toDate())) })
  }
  return options
})()
