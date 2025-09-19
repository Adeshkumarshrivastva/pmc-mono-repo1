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

export function formatDateTime(dateTime: Date) {
  return dateTime.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
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

export function getPreBookingQnA({ booking }: BookingConfirmationProps) {
  if (!booking.preBookingQnA || !Array.isArray(booking.preBookingQnA)) {
    return []
  }

  return booking.preBookingQnA as Array<{ question: string; answer: string }>
}
