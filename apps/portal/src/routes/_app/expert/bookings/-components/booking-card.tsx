import { CalendarIcon, ChevronDownIcon, UserIcon } from 'lucide-react'
import { match } from 'ts-pattern'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import dayjs from '@/lib/dayjs'
import { formatDateTimeRange } from '@/lib/date'
import type { Booking, BookingPeriod } from '@/lib/booking'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type BookingCardProps = {
  booking: Booking
  period: BookingPeriod
  onViewDetails?: () => void
  onReschedule?: () => void
}

export default function BookingCard({ booking, period, onViewDetails }: BookingCardProps) {
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
            .with('upcoming', () => {
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button icon={<ChevronDownIcon />} iconPosition="right" variant="outline" className="">
                      {booking.status}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })
            .with('past', () => {
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button icon={<ChevronDownIcon />} iconPosition="right" variant="outline" className="capitalize">
                      Mark As
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem disabled>Completed</DropdownMenuItem>
                    <DropdownMenuItem disabled>No Show</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })
            .otherwise(() => null)}
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
