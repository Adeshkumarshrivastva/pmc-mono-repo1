import { CalendarIcon, UserIcon } from 'lucide-react'
import { match } from 'ts-pattern'
import type { InferResponseType } from 'hono/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dayjs from '@/lib/dayjs'
import { formatDateTimeRange } from '@/lib/date'
import type { BookingPeriod } from '@/lib/booking'
import { Button } from '@/components/ui/button'
import type { honoClient } from '@/lib/hono-client'

type PatientBookingsResponse = InferResponseType<(typeof honoClient)['server']['patient']['bookings']['$get'], 200>

type Booking = PatientBookingsResponse['bookings'][number]

type PatientBookingCardProps = {
  booking: Booking
  period: BookingPeriod
  onViewDetails?: () => void
  onReschedule?: () => void
}

export default function PatientBookingCard({ booking, period, onViewDetails }: PatientBookingCardProps) {
  return (
    <Card
      className="transition-all duration-200 cursor-pointer h-full flex flex-col relative"
      onClick={() => {
        onViewDetails?.()
      }}
    >
      <div className="h-full w-2 bg-primary absolute left-0 top-0 rounded-l-lg" />
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold flex-1 min-w-0">{booking.serviceName}</CardTitle>
          {match(period)
            .with('past', () => {
              return booking.prescription ? (
                <Button variant="outline" className="capitalize">
                  View Prescription
                </Button>
              ) : null
            })
            .otherwise(() => null)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <UserIcon className="size-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground font-bold">
            {booking.expert?.user?.name || booking.expert?.name || 'Unknown Expert'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="size-4 text-muted-foreground flex-shrink-0" />
          <div className="text-muted-foreground font-bold">
            {formatDateTimeRange({
              startDateTime: dayjs(booking.startDateTime).toDate(),
              endDateTime: dayjs(booking.endDateTime).toDate(),
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
