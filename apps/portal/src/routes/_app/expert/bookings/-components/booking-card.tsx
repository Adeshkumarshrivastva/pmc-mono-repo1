import type { InferResponseType } from 'hono'
import { CalendarIcon, MapPinIcon, VideoIcon, UserIcon } from 'lucide-react'
import { match } from 'ts-pattern'
import type { HonoClient } from '@/lib/hono-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import dayjs from '@/lib/dayjs'
import { formatDateTimeRange } from '@/lib/date'

type BookingCardProps = {
  booking: InferResponseType<HonoClient['server']['experts']['bookings']['$get'], 200>['bookings'][number]
  onViewDetails?: () => void
  onReschedule?: () => void
}

export default function BookingCard({ booking, onViewDetails, onReschedule }: BookingCardProps) {
  const isUpcoming = dayjs(booking.startDateTime).isAfter(dayjs())
  const canReschedule = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && isUpcoming

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold flex-1 min-w-0">{booking.serviceName}</CardTitle>
          <Badge variant={getStatusBadgeVariant(booking.status)} className="flex-shrink-0">
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
        <div className="flex items-center gap-2 text-sm">
          {match(booking.mode)
            .returnType<React.ReactNode>()
            .with('IN_PERSON', () => (
              <>
                <MapPinIcon className="size-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground font-bold">Some random location</span>
              </>
            ))
            .with('VIRTUAL', () => (
              <>
                <VideoIcon className="size-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground font-bold">Meet link</span>
              </>
            ))
            .otherwise(() => null)}
        </div>
        <div className="pt-2 border-t flex gap-2">
          <Button className="flex-1" onClick={onViewDetails} size="sm">
            View Details
          </Button>
          {canReschedule && (
            <Button variant="outline" className="flex-1" onClick={onReschedule} size="sm">
              Reschedule
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DRAFT: 'secondary',
    CONFIRMED: 'default',
    CANCELLED: 'destructive',
    COMPLETED: 'outline',
  }
  return variants[status] || 'default'
}
