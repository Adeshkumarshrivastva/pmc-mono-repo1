import { useState } from 'react'
import { createFileRoute, invariant, useNavigate } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import BookingCalendar from './-components/booking-calendar'
import AvailableSlots from './-components/available-slots'
import ExpertService from './-components/expert-service'
import SlotSummary from './-components/slot-summary'
import PhoneVerificationForm from './-components/phone-verification-form'

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
  const [mode, setMode] = useState<Mode>({ type: 'select_slot' })
  const { user } = Route.useLoaderData()

  return (
    <div className="h-screen w-full bg-accent">
      <div className="container h-full mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {match(mode)
          .returnType<React.ReactNode>()
          .with({ type: 'select_slot' }, () => {
            return (
              <div className="h-full flex flex-col gap-4 xl:flex-row xl:gap-6 xl:justify-center">
                <div className="w-full h-full xl:max-w-sm bg-background rounded-xl shadow-md p-4">
                  <ExpertService
                    serviceSlug={serviceSlug}
                    expertSlug={expertSlug}
                    onBack={() => {
                      navigate({ to: '/expert/$expertSlug', params: { expertSlug } })
                    }}
                  />
                </div>

                <div className="h-full xl:flex-1 flex justify-center bg-background rounded-xl shadow-md p-4">
                  <BookingCalendar />
                </div>

                <div className="w-full h-full flex flex-col xl:max-w-sm bg-background rounded-xl shadow-md ">
                  <AvailableSlots
                    serviceSlug={serviceSlug}
                    expertSlug={expertSlug}
                    onNext={() => {
                      if (!user) {
                        setMode({ type: 'verify_identity' })
                      } else {
                        setMode({ type: 'fill_prebooking_info' })
                      }
                    }}
                  />
                </div>
              </div>
            )
          })
          .with({ type: 'verify_identity' }, () => {
            return (
              <div className="h-full flex flex-col gap-4 xl:flex-row xl:gap-6 xl:justify-center">
                <div className="w-full h-full xl:max-w-sm bg-background rounded-xl shadow-md p-4">
                  <SlotSummary
                    onBack={() => {
                      setMode({
                        type: 'select_slot',
                      })
                    }}
                  />
                </div>
                <div className="h-full xl:flex-1 bg-background rounded-xl shadow-md p-4">
                  <PhoneVerificationForm />
                </div>
              </div>
            )
          })
          .with({ type: 'fill_prebooking_info' }, () => {
            return (
              <div className="h-full flex flex-col gap-4 xl:flex-row xl:gap-6 xl:justify-center">
                <div className="w-full h-full xl:max-w-sm bg-background rounded-xl shadow-md p-4">
                  <SlotSummary
                    onBack={() => {
                      setMode({
                        type: 'select_slot',
                      })
                    }}
                  />
                </div>
                <div className="h-full xl:flex-1 bg-background rounded-xl shadow-md p-4">
                  <div>Prebooking Info Form</div>
                </div>
              </div>
            )
          })
          .otherwise(() => null)}
      </div>
    </div>
  )
}

type Mode =
  | { type: 'select_slot' }
  | { type: 'verify_identity' }
  | { type: 'fill_prebooking_info' }
  | { type: 'payment' }
