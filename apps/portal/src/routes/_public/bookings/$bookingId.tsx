import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  GlobeIcon,
  UserIcon,
} from 'lucide-react'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import { honoClient } from '@/lib/hono-client'
import { DEFAULT_TIMEZONE, formatDateTimeRange } from '@/lib/date'
import { CURRENCY_CONFIG } from '@/lib/booking'
import { inPersonLocationSchema, SERVICE_MODE_CONFIG, virtualLocationSchema } from '@/lib/service'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public/bookings/$bookingId')({
  component: BookingConfirmationPage,
  loader: async ({ context: { queryClient }, params: { bookingId } }) => {
    const expertBooking = await queryClient.ensureQueryData({
      queryKey: ['expert-booking', bookingId],
      queryFn: () => fetchExpertBooking(bookingId),
    })

    return { booking: expertBooking.booking }
  },
  pendingComponent: () => {
    return (
      <div className="h-screen bg-accent flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  },
})

function BookingConfirmationPage() {
  const { booking } = Route.useLoaderData()

  return (
    <div className="h-screen w-full bg-accent">
      <div className="container h-full flex flex-col xl:justify-center mx-auto px-0 py-0 md:px-4 md:py-8 max-w-7xl">
        <div className="h-full xl:max-h-[700px] flex flex-col items-center justify-center md:justify-start xl:rounded-md xl:shadow-md bg-background p-2 md:p-8">
          <div className="space-y-2 max-w-lg">
            <div className="space-y-4">
              <h1 className="flex items-center justify-center text-xl gap-1 font-semibold">
                <CheckCircle2Icon className="text-primary-foreground fill-primary" />
                <span>Your Booking is Confirmed</span>
              </h1>
              {booking.calendarEventId ? (
                <div className="text-sm text-center">A calendar invitation has been sent to your email address.</div>
              ) : null}
            </div>
            <div className="space-y-8 border rounded-md py-4 px-2">
              <div className="space-y-2 px-6">
                <div className="text-xl font-semibold">{booking.serviceName}</div>
                <Link
                  to={`/experts/$expertSlug`}
                  params={{ expertSlug: booking.expert.slug }}
                  className="flex items-center gap-3"
                >
                  {booking.expert.image ? (
                    <img src={booking.expert.image} alt={booking.expert.name} className="size-12 rounded-full" />
                  ) : (
                    <div className="flex items-center justify-center size-12 bg-gray-200 rounded-full">
                      <UserIcon className="size-6 text-gray-400" />{' '}
                    </div>
                  )}
                  <div className="text-muted-foreground font-bold">{booking.expert.name}</div>
                </Link>
              </div>
              <div className="space-y-4 px-6">
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-5 text-muted-foreground shrink-0" />
                  <div className="text-muted-foreground font-bold text-sm">
                    {booking.serviceDurationInMinutes} minutes
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-5 text-muted-foreground shrink-0" />
                  <div className="text-muted-foreground font-bold text-sm">
                    {formatDateTimeRange({
                      startDateTime: new Date(booking.startDateTime),
                      endDateTime: new Date(booking.endDateTime),
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-5 text-muted-foreground shrink-0" />
                  <div className="text-muted-foreground font-bold text-sm">{DEFAULT_TIMEZONE}</div>
                </div>
                {match(booking.mode)
                  .with('IN_PERSON', () => {
                    const Icon = SERVICE_MODE_CONFIG[booking.mode].icon
                    const inPersonLocation = inPersonLocationSchema.parse(booking.inPersonLocation)
                    return (
                      <div className="flex items-center gap-2">
                        <Icon className="size-5 text-muted-foreground shrink-0" />
                        <div className="space-y-1">
                          <div className="text-muted-foreground font-bold text-sm">{inPersonLocation?.address}</div>
                          {inPersonLocation?.googleMapLink ? (
                            <a
                              href={inPersonLocation.googleMapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                            >
                              Google Map Link
                              <ExternalLinkIcon className="size-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                  .with('VIRTUAL', () => {
                    const Icon = SERVICE_MODE_CONFIG[booking.mode].icon
                    const virtualLocation = virtualLocationSchema.parse(booking.virtualLocation)
                    return (
                      <div className="flex items-center gap-2">
                        <Icon className="size-5 text-muted-foreground" />
                        {virtualLocation?.meetLink ? (
                          <a
                            href={virtualLocation.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-muted-foreground font-bold text-sm"
                          >
                            {virtualLocation?.meetLink}
                            <ExternalLinkIcon className="size-3.5" />
                          </a>
                        ) : null}
                      </div>
                    )
                  })
                  .exhaustive()}
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="size-5 text-muted-foreground shrink-0" />
                  <div className="text-muted-foreground font-bold text-sm">
                    {CURRENCY_CONFIG[booking.serviceCurrency].symbol}
                    {booking.servicePrice}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4">
              <Link to={`/patient/dashboard`}>
                <Button>Go to dashboard</Button>
              </Link>
            </div>
          </div>
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
