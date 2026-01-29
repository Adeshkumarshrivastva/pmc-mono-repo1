import { useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { honoClient } from '@/lib/hono-client'
import BookingCalendar from './-components/booking-calendar'
import AvailableSlots from './-components/available-slots'
import BookingSummary from './-components/booking-summary'
import PhoneVerificationForm from './-components/phone-verification-form'
import PrebookingForm from './-components/prebooking-form'
import type { BookingMode } from '@/lib/booking'
import { useBooking } from './-hooks/use-booking'
import { invariant } from '@/lib/utils'
import { CURRENT_SESSION_QUERY_KEY, getUserSession } from '@/queries/session'

export const Route = createFileRoute('/_public/experts/$expertSlug/$serviceSlug')({
  component: ExpertServiceBookingPage,
  shouldReload: false,
  loader: async ({ context: { queryClient }, params: { expertSlug, serviceSlug } }) => {
    const service = await queryClient.fetchQuery({
      queryKey: ['expert-service', expertSlug, serviceSlug],
      queryFn: () => fetchExpertService(expertSlug, serviceSlug),
    })

    invariant(service, 'service should be present')

    const session = await queryClient.fetchQuery({
      queryKey: CURRENT_SESSION_QUERY_KEY,
      queryFn: getUserSession,
    })

    if (session.data?.user) {
      const patient = await queryClient.fetchQuery({
        queryKey: ['patient-details'],
        queryFn: fetchPatientDetails,
      })

      return { service, user: session.data.user, patient }
    }

    return { service }
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

function ExpertServiceBookingPage() {
  const navigate = useNavigate()
  const router = useRouter()

  const { expertSlug, serviceSlug } = Route.useParams()
  const { service, user, patient } = Route.useLoaderData()
  const [mode, setMode] = useState<BookingMode>({ type: 'select_slot' })

  const { month, year } = useBooking()

  const getMonthlyAvailableSlotsQuery = useQuery({
    queryKey: ['monthly-available-slots', month, year],
    queryFn: () => fetchMonthlyAvailableSlots(expertSlug, serviceSlug, year, month),
  })

  return (
    <div className="min-h-screen xl:h-screen w-full bg-accent">
      <div className="container h-full flex flex-col xl:justify-center mx-auto max-w-7xl">
        <div className="h-full min-h-screen xl:min-h-auto xl:max-h-[700px] md:w-lg xl:w-auto md:mx-auto xl:mx-0 xl:max-w-full flex flex-col xl:flex-row xl:justify-center xl:rounded-md xl:shadow-md bg-background">
          {match(mode)
            .returnType<React.ReactNode>()
            .with({ type: 'select_slot' }, () => {
              return (
                <>
                  <div className="w-full h-full xl:max-w-sm xl:rounded-l-xl">
                    <BookingSummary
                      mode={mode}
                      service={service}
                      onBack={() => {
                        navigate({ to: '/experts/$expertSlug', params: { expertSlug }, replace: true })
                      }}
                    />
                  </div>

                  <div className="h-full xl:flex-1 flex justify-center xl:border-l xl:border-r p-4 xl:p-4">
                    <BookingCalendar getMonthlyAvailableSlotsQuery={getMonthlyAvailableSlotsQuery} />
                  </div>

                  <div className="w-full h-full flex flex-col xl:max-w-sm xl:rounded-r-xl">
                    <AvailableSlots
                      getMonthlyAvailableSlotsQuery={getMonthlyAvailableSlotsQuery}
                      onNext={() => {
                        if (!user || !user.phoneNumber) {
                          setMode({ type: 'verify_identity' })
                        } else {
                          setMode({ type: 'fill_prebooking_info', phoneNumber: user.phoneNumber })
                        }
                      }}
                    />
                  </div>
                </>
              )
            })
            .with({ type: 'verify_identity' }, () => {
              return (
                <>
                  <div className="w-full h-full xl:max-w-sm xl:rounded-l-xl">
                    <BookingSummary
                      service={service}
                      mode={mode}
                      onBack={() => {
                        setMode({
                          type: 'select_slot',
                        })
                      }}
                    />
                  </div>
                  <Separator className="hidden xl:block" orientation="vertical" />
                  <div className="w-full h-full xl:rounded-r-xl p-6 space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground">Verify Your Identity</h2>
                    <div className="w-full">
                      <PhoneVerificationForm
                        onNext={(phoneNumber) => {
                          router.invalidate()
                          setMode({ type: 'fill_prebooking_info', phoneNumber })
                        }}
                      />
                    </div>
                  </div>
                </>
              )
            })
            .with({ type: 'fill_prebooking_info' }, (mode) => {
              return (
                <>
                  <div className="w-full xl:max-w-sm  xl:rounded-l-xl">
                    <BookingSummary
                      service={service}
                      mode={mode}
                      onBack={() => {
                        setMode({
                          type: 'select_slot',
                        })
                      }}
                    />
                  </div>
                  <Separator className="hidden xl:block" orientation="vertical" />
                  <div className="w-full h-full rounded-none xl:rounded-r-xl space-y-4 p-6">
                    <h2 className="text-2xl font-semibold text-foreground">Enter Details</h2>
                    <div className="w-full max-w-sm">
                      <PrebookingForm
                        phoneNumber={mode.phoneNumber}
                        serviceId={service.id}
                        expertId={service.expertId}
                        expertSlug={expertSlug}
                        serviceSlug={serviceSlug}
                        availableModes={service.availableModes}
                        paymentMode={service.paymentMode}
                        price={service.price}
                        currency={service.currency}
                        patientName={patient?.name}
                        patientEmail={patient?.email || undefined}
                        additionalCharges={service.additionalCharges?.map((ac) => ({
                          startTime: new Date(ac.startTime),
                          endTime: new Date(ac.endTime),
                          price: ac.price,
                          description: ac.description,
                        }))}
                      />
                    </div>
                  </div>
                </>
              )
            })
            .otherwise(() => null)}
        </div>
      </div>
    </div>
  )
}

async function fetchExpertService(expertSlug: string, serviceSlug: string) {
  const res = await honoClient.server.experts[':expertSlug'].service[':serviceSlug'].$get({
    param: { expertSlug, serviceSlug },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch service')
  }

  const service = await res.json()
  return service
}

async function fetchMonthlyAvailableSlots(expertSlug: string, serviceSlug: string, year: number, month: number) {
  const res = await honoClient.server.experts[':expertSlug']['monthly-available-slots'][':serviceSlug'].$get({
    param: { expertSlug, serviceSlug },
    query: { year: `${year}`, month: `${month}` },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch available slots')
  }
  const slots = await res.json()
  return slots
}

async function fetchPatientDetails() {
  const res = await honoClient.server.patient['patient-details'].$get()
  if (!res.ok) {
    return null
  }
  return res.json()
}
