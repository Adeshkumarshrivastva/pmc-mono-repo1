import { useState } from 'react'
import { createFileRoute, invariant, useNavigate } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
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
  const [mode, setMode] = useState<BookingMode>({ type: 'select_slot' })
  const { user } = Route.useLoaderData()

  return (
    <div className="h-screen w-full bg-accent">
      <div className="container h-full flex flex-col xl:justify-center mx-auto px-0 py-0 md:px-4 md:py-8 max-w-7xl">
        {match(mode)
          .returnType<React.ReactNode>()
          .with({ type: 'select_slot' }, () => {
            return (
              <div className="h-full xl:max-h-[700px] flex flex-col xl:flex-row xl:justify-center xl:rounded-md xl:shadow-md">
                <div className="w-full h-full xl:max-w-sm bg-background p-4 xl:rounded-l-xl">
                  <BookingSummary
                    mode={mode}
                    serviceSlug={serviceSlug}
                    expertSlug={expertSlug}
                    onBack={() => {
                      navigate({ to: '/expert/$expertSlug', params: { expertSlug }, replace: true })
                    }}
                  />
                </div>

                <div className="h-full xl:flex-1 flex justify-center bg-background rounded-none xl:border-l xl:border-r p-4 md:p-16 xl:p-4">
                  <BookingCalendar />
                </div>

                <div className="w-full h-full flex flex-col xl:max-w-sm bg-background rounded-none xl:rounded-r-xl">
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
              <div className="h-full xl:max-h-[700px] flex flex-col xl:flex-row xl:justify-center xl:rounded-md xl:shadow-md">
                <div className="w-full xl:max-w-sm bg-background p-4 xl:rounded-l-xl">
                  <BookingSummary
                    mode={mode}
                    serviceSlug={serviceSlug}
                    expertSlug={expertSlug}
                    onBack={() => {
                      setMode({
                        type: 'select_slot',
                      })
                    }}
                  />
                </div>
                <Separator className="hidden xl:block" orientation="vertical" />
                <div className="w-full h-full flex flex-col space-y-4 bg-background rounded-none xl:rounded-r-xl p-4">
                  <h2 className="text-2xl font-semibold text-foreground">Verify Your Identity</h2>
                  <div className="w-full">
                    <PhoneVerificationForm
                      onNext={() => {
                        setMode({ type: 'fill_prebooking_info' })
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })
          .with({ type: 'fill_prebooking_info' }, () => {
            return (
              <div className="h-full xl:max-h-[700px] flex flex-col xl:flex-row xl:justify-center xl:rounded-md xl:shadow-md">
                <div className="w-full xl:max-w-sm bg-background p-4 xl:rounded-l-xl">
                  <BookingSummary
                    mode={mode}
                    serviceSlug={serviceSlug}
                    expertSlug={expertSlug}
                    onBack={() => {
                      setMode({
                        type: 'select_slot',
                      })
                    }}
                  />
                </div>
                <Separator className="hidden xl:block" orientation="vertical" />
                <div className="w-full h-full bg-background rounded-none xl:rounded-r-xl space-y-4 p-4">
                  <h2 className="text-2xl font-semibold text-foreground">Enter Details</h2>
                  <div className="w-full max-w-sm">
                    <PrebookingForm onNext={() => {}} />
                  </div>
                </div>
              </div>
            )
          })
          .otherwise(() => null)}
      </div>
    </div>
  )
}
