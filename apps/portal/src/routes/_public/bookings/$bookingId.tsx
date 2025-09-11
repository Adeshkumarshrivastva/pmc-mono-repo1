import { createFileRoute } from '@tanstack/react-router'
import { CalendarIcon, CheckCircle2Icon, ClockIcon, IndianRupeeIcon, UserIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import { honoClient } from '@/lib/hono-client'
import { formatDateTimeRange } from '@/lib/date'

export const Route = createFileRoute('/_public/bookings/$bookingId')({
  component: BookingConfirmationPage,
  pendingComponent: () => {
    return (
      <div className="h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  },
})

function BookingConfirmationPage() {
  const { bookingId } = Route.useParams()

  const getExpertBookingQuery = useQuery({
    queryKey: ['expert-booking', bookingId],
    queryFn: () => fetchExpertBooking(bookingId),
  })

  return (
    <div className="h-screen w-full bg-accent">
      <div className="container h-full flex flex-col xl:justify-center mx-auto px-0 py-0 md:px-4 md:py-8 max-w-7xl">
        <div className="h-full xl:max-h-[700px] flex flex-col items-center xl:rounded-md xl:shadow-md bg-background p-8">
          {match(getExpertBookingQuery)
            .returnType<React.ReactNode>()
            .with({ status: 'error' }, () => {
              return <div>Error loading booking</div>
            })
            .with({ status: 'pending' }, () => {
              return (
                <div className="flex items-center gap-2">
                  <Spinner /> Loading...
                </div>
              )
            })
            .with({ status: 'success' }, ({ data: { booking } }) => {
              return (
                <div className="space-y-2 max-w-lg">
                  <div>
                    <div className="flex items-center justify-center text-xl gap-1 font-semibold">
                      <CheckCircle2Icon className="text-primary-foreground fill-primary" />
                      <span>Your Booking is Confirmed</span>
                    </div>
                  </div>
                  <div className="space-y-8 border rounded-md py-4 px-2">
                    <div className="space-y-2 px-6">
                      <div className="text-xl font-semibold">{booking.serviceName}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                          <UserIcon className="size-6 text-gray-400" />
                        </div>
                        <div className="text-gray-600">{booking.expert.name}</div>
                      </div>
                    </div>
                    <div className="space-y-4 px-6">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="size-5 text-gray-600" />
                        <div className="text-gray-600 font-medium">{booking.serviceDurationInMinutes} minutes</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-5 text-gray-600" />
                        <div className="text-gray-600 font-medium">
                          {formatDateTimeRange({
                            startDateTime: new Date(booking.startDateTime),
                            endDateTime: new Date(booking.endDateTime),
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupeeIcon className="size-5 text-gray-600" />
                        <div className="text-gray-600 font-medium">{booking.servicePrice}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
            .otherwise(() => null)}
        </div>
      </div>
    </div>
  )
}

async function fetchExpertBooking(bookingId: string) {
  const res = await honoClient.server.experts.bookings[':bookingId'].$get({
    param: { bookingId },
  })

  if (!res.ok) {
    throw new Error('Booking not found')
  }

  return res.json()
}
