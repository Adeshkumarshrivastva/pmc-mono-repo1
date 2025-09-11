import { useState } from 'react'
import { createFileRoute, invariant, useNavigate } from '@tanstack/react-router'
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

export const Route = createFileRoute('/_public/expert/$expertSlug/$serviceSlug')({
  component: ExpertServiceBookingPage,
  loader: async ({ context: { authClient } }) => {
    invariant(authClient, 'authClient should be present')
    const session = await authClient?.getSession()

    if (session.data) {
      return { user: session.data.user }
    }

    return {}
  },
  pendingComponent: () => {
    return (
      <div className="h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  },
})

function ExpertServiceBookingPage() {
  const navigate = useNavigate()
  const { expertSlug, serviceSlug } = Route.useParams()
  const { user } = Route.useLoaderData()
  const [mode, setMode] = useState<BookingMode>({ type: 'select_slot' })

  const getServiceQuery = useQuery({
    queryKey: ['expert-service', expertSlug, serviceSlug],
    queryFn: () => fetchExpertService(expertSlug, serviceSlug),
    enabled: !!expertSlug && !!serviceSlug,
  })

  return (
    <div className="h-screen w-full bg-accent">
      <div className="container h-full flex flex-col xl:justify-center mx-auto px-0 py-0 md:px-4 md:py-8 max-w-7xl">
        {match(getServiceQuery)
          .returnType<React.ReactNode>()
          .with({ status: 'pending' }, () => (
            <div className="h-full w-full flex items-center justify-center">
              <Spinner /> <span className="ml-2">Loading...</span>
            </div>
          ))
          .with({ status: 'error' }, () => <div>Error loading service</div>)
          .with({ status: 'success' }, ({ data: service }) => {
            return (
              <div className="h-full xl:max-h-[700px] flex flex-col xl:flex-row xl:justify-center xl:rounded-md xl:shadow-md bg-background">
                {match(mode)
                  .returnType<React.ReactNode>()
                  .with({ type: 'select_slot' }, () => {
                    return (
                      <>
                        <div className="w-full h-full xl:max-w-sm  xl:rounded-l-xl">
                          <BookingSummary
                            mode={mode}
                            service={service}
                            onBack={() => {
                              navigate({ to: '/expert/$expertSlug', params: { expertSlug }, replace: true })
                            }}
                          />
                        </div>

                        <div className="h-full xl:flex-1 flex justify-center  rounded-none xl:border-l xl:border-r p-4 md:p-16 xl:p-4">
                          <BookingCalendar />
                        </div>

                        <div className="w-full h-full flex flex-col xl:max-w-sm  rounded-none xl:rounded-r-xl">
                          <AvailableSlots
                            serviceSlug={serviceSlug}
                            expertSlug={expertSlug}
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
                        <div className="w-full h-full flex flex-col space-y-4  rounded-none xl:rounded-r-xl p-6">
                          <h2 className="text-2xl font-semibold text-foreground">Verify Your Identity</h2>
                          <div className="w-full">
                            <PhoneVerificationForm
                              onNext={(phoneNumber) => {
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
                        <div className="w-full h-full  rounded-none xl:rounded-r-xl space-y-4 p-6">
                          <h2 className="text-2xl font-semibold text-foreground">Enter Details</h2>
                          <div className="w-full max-w-sm">
                            <PrebookingForm
                              phoneNumber={mode.phoneNumber}
                              serviceId={service.id}
                              expertId={service.expertId}
                            />
                          </div>
                        </div>
                      </>
                    )
                  })
                  .otherwise(() => null)}
              </div>
            )
          })
          .otherwise(() => null)}
      </div>
    </div>
  )
}

const fetchExpertService = async (expertSlug: string, serviceSlug: string) => {
  const res = await honoClient.server.experts[':expertSlug'].service[':serviceSlug'].$get({
    param: { expertSlug, serviceSlug },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch service')
  }

  const service = await res.json()
  return service
}
