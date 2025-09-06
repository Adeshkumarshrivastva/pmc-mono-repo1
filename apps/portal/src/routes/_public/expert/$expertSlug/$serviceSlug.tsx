import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import BookingCalendar from './-components/booking-calendar'
import AvailableSlots from './-components/available-slots'
import ExpertService from './-components/expert-service'

export const Route = createFileRoute('/_public/expert/$expertSlug/$serviceSlug')({
  component: ExpertServiceBookingPage,
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
  const { expertSlug, serviceSlug } = Route.useParams()
  const [mode, setMode] = useState<Mode>({ type: 'select_slot', backUrl: `/expert/${expertSlug}` })

  return (
    <div className="h-screen w-full bg-accent">
      <div className="container h-full mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {match(mode)
          .returnType<React.ReactNode>()
          .with({ type: 'select_slot' }, () => {
            return (
              <div className="h-full flex flex-col gap-4 xl:flex-row xl:gap-6 xl:justify-center">
                <div className="w-full h-full xl:max-w-sm bg-background rounded-xl shadow-md p-4">
                  <ExpertService serviceSlug={serviceSlug} expertSlug={expertSlug} />
                </div>

                <div className="h-full xl:flex-1 flex justify-center bg-background rounded-xl shadow-md p-4">
                  <BookingCalendar />
                </div>

                <div className="w-full h-full flex flex-col xl:max-w-sm bg-background rounded-xl shadow-md ">
                  <AvailableSlots
                    serviceSlug={serviceSlug}
                    expertSlug={expertSlug}
                    onNext={() => {
                      setMode({ type: 'verify_identity' })
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
                  Service and Selected Slot Summary
                </div>
                <div className="h-full xl:flex-1 flex justify-center bg-background rounded-xl shadow-md p-4">
                  Identity Verification Form
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
  | { type: 'select_slot'; backUrl: string }
  | { type: 'verify_identity'; backUrl?: string }
  | { type: 'fill_prebooking_info'; backUrl?: string }
  | { type: 'payment'; backUrl?: string }
