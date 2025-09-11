import type { InferResponseType } from 'hono'
import type { HonoClient } from './hono-client'

export type BookingMode =
  | { type: 'select_slot' }
  | { type: 'verify_identity' }
  | { type: 'fill_prebooking_info'; phoneNumber: string }
  | { type: 'payment' }

export const SERVICE_MODES = ['VIRTUAL', 'IN_PERSON'] as const
export type ServiceMode = (typeof SERVICE_MODES)[number]

export type MonthlyAvailableSlots = InferResponseType<
  HonoClient['server']['experts'][':expertSlug']['monthly-available-slots'][':serviceSlug']['$get'],
  200
>

export const DATE_FORMAT = 'DD-MM-YYYY'
