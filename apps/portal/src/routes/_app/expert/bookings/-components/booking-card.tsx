import { CalendarIcon, UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dayjs from '@/lib/dayjs'
import { formatDateTimeRange } from '@/lib/date'
import type { Booking } from '@/lib/booking'
import { Badge } from '@/components/ui/badge'

type BookingCardProps = {
  booking: Booking
  onViewDetails?: () => void
  onReschedule?: () => void
}

export default function BookingCard({ booking, onViewDetails }: BookingCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col"
      onClick={() => {
        onViewDetails?.()
      }}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold flex-1 min-w-0">{booking.serviceName}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <UserIcon className="size-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground font-bold">{booking.patientName}</span>
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
