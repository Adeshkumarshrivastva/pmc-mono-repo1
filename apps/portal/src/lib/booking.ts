export type BookingMode =
  | { type: 'select_slot' }
  | { type: 'verify_identity' }
  | { type: 'fill_prebooking_info' }
  | { type: 'payment' }
