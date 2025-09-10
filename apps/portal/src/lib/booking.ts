export type BookingMode =
  | { type: 'select_slot' }
  | { type: 'verify_identity' }
  | { type: 'fill_prebooking_info'; phoneNumber: string }
  | { type: 'payment' }

export const SERVICE_MODES = ['VIRTUAL', 'IN_PERSON'] as const
export type ServiceMode = (typeof SERVICE_MODES)[number]
