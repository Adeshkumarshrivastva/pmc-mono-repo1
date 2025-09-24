import type { InferResponseType } from 'hono'
import { CalendarIcon, MapPinIcon, VideoIcon, UserIcon } from 'lucide-react'
import { match } from 'ts-pattern'
import type { HonoClient } from '@/lib/hono-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import dayjs from '@/lib/dayjs'
import { formatDateTimeRange } from '@/lib/date'

type BookingCardProps = {
  booking: InferResponseType<HonoClient['server']['experts']['bookings']['$get'], 200>['bookings'][number]
}

export default function BookingCard({ booking }: BookingCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{booking.serviceName}</CardTitle>
          <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="size-5 text-muted-foreground" />
            <span className="text-muted-foreground">{booking.patientName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-muted-foreground" />
          <div className="text-muted-foreground font-bold text-sm">
            {formatDateTimeRange({
              startDateTime: dayjs(booking.startDateTime).toDate(),
              endDateTime: dayjs(booking.endDateTime).toDate(),
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm pt-2">
          {match(booking.mode)
            .returnType<React.ReactNode>()
            .with('IN_PERSON', () => {
              return (
                <>
                  <MapPinIcon className="size-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Some random location</span>
                </>
              )
            })
            .with('VIRTUAL', () => {
              return (
                <>
                  <VideoIcon className="size-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Meet link</span>
                </>
              )
            })
            .otherwise(() => null)}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusBadgeVariant(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DRAFT: 'secondary',
    CONFIRMED: 'default',
    CANCELLED: 'destructive',
    COMPLETED: 'outline',
  }
  return variants[status] || 'default'
}
