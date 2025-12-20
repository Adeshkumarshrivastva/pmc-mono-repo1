import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { honoClient } from '@/lib/hono-client'
import BookingCard from './-components/expert-booking-card'
import BookingInfo from './-components/expert-booking-info'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { BOOKING_PERIODS, type BookingPeriod } from '@/lib/booking'

export const Route = createFileRoute('/_app/expert/bookings/')({
  component: ExpertBookings,
  loader: ({ context: { user } }) => {
    return { user }
  },
  pendingComponent: () => {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground text-xs font-medium">Loading...</div>
      </div>
    )
  },
})

function ExpertBookings() {
  const [period, setPeriod] = useState<BookingPeriod>('upcoming')
  const [selectedBooking, setSelectedBooking] = useState<undefined | string>(undefined)

  const getExpertBookingsQuery = useQuery({
    queryKey: ['get-expert-bookings', period],
    queryFn: () => fetchExpertBookings(period),
  })

  return (
    <div className="h-full w-full flex flex-col space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
      </div>

      <Tabs value={period} className="w-full flex-1 rounded-lg border">
        <div className="h-full flex flex-col overflow-auto">
          <div className="flex flex-col justify-between gap-y-2 lg:flex-row p-4">
            <TabsList className="w-full md:w-lg">
              {BOOKING_PERIODS.map((period) => (
                <TabsTrigger
                  key={period}
                  value={period}
                  className="h-8 w-full lg:w-auto"
                  onClick={() => {
                    setPeriod(period)
                  }}
                >
                  {BOOKING_PERIODS_CONFIG[period].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Separator />
          <>
            {BOOKING_PERIODS.map((period) => (
              <TabsContent key={`${period}-bookings`} value={period} className="p-4">
                {match(getExpertBookingsQuery)
                  .returnType<React.ReactNode>()
                  .with({ status: 'error' }, () => (
                    <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border">
                      Error loading bookings
                    </div>
                  ))
                  .with({ status: 'pending' }, () => (
                    <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border">
                      <Spinner /> Loading...
                    </div>
                  ))
                  .with({ status: 'success' }, ({ data: { bookings } }) => {
                    return bookings.length === 0 ? (
                      <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border">
                        <p className="text-lg font-medium">No {period} bookings found</p>
                        <p className="text-sm text-muted-foreground">Once you have bookings, they’ll appear here.</p>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {bookings.map((booking) => (
                            <BookingCard
                              onViewDetails={() => {
                                setSelectedBooking(booking.id)
                              }}
                              key={booking.id}
                              booking={booking}
                              period={period}
                            />
                          ))}
                        </div>
                        {typeof selectedBooking !== 'undefined' ? (
                          <Sheet
                            open={typeof selectedBooking !== 'undefined'}
                            onOpenChange={() => {
                              setSelectedBooking(undefined)
                            }}
                          >
                            <SheetContent
                              className="w-full sm:max-w-2xl overflow-y-auto"
                              onInteractOutside={(event) => {
                                event.preventDefault()
                              }}
                            >
                              <SheetHeader>
                                <SheetTitle>Booking Summary</SheetTitle>
                              </SheetHeader>
                              <Separator />
                              <BookingInfo booking={bookings.find((booking) => booking.id === selectedBooking)!} />
                            </SheetContent>
                          </Sheet>
                        ) : null}
                      </div>
                    )
                  })
                  .otherwise(() => null)}
              </TabsContent>
            ))}
          </>
        </div>
      </Tabs>
    </div>
  )
}

const BOOKING_PERIODS_CONFIG: Record<BookingPeriod, { label: string; value: BookingPeriod }> = {
  upcoming: {
    label: 'Upcoming Bookings',
    value: 'upcoming',
  },
  past: {
    label: 'Past Bookings',
    value: 'past',
  },
}

async function fetchExpertBookings(period: BookingPeriod) {
  const response = await honoClient['server']['experts']['bookings'].$get({
    query: {
      period,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch experts')
  }
  return response.json()
}
