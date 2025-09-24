import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { honoClient } from '@/lib/hono-client'
import BookingCard from './-components/booking-card'

export const Route = createFileRoute('/_app/expert/bookings/')({
  component: ExpertBookings,
  beforeLoad: ({ context: { user } }) => {
    if (user.role === 'PATIENT') {
      throw redirect({ to: '/patient/dashboard' })
    }
  },
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
                    return (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
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

const BOOKING_PERIODS = ['upcoming', 'past'] as const
type BookingPeriod = (typeof BOOKING_PERIODS)[number]

const BOOKING_PERIODS_CONFIG: Record<BookingPeriod, { label: string; value: BookingPeriod }> = {
  upcoming: {
    label: 'Upcoming',
    value: 'upcoming',
  },
  past: {
    label: 'Past',
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
