import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import BookingCalendar from './-components/booking-calendar'

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
  const { expertSlug } = Route.useParams()
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
                  <div>Service and Expert Info</div>
                </div>

                <div className="h-full xl:flex-1 flex justify-center bg-background rounded-xl shadow-md p-4">
                  <BookingCalendar />
                </div>

                <div className="w-full h-full xl:max-w-sm bg-background rounded-xl shadow-md p-4">
                  <div className="flex-1 border-b pb-4">
                    <div>Available Slots</div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => {
                        setMode({ type: 'verify_identity' })
                      }}
                      className="w-full sm:w-auto"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
          .with({ type: 'verify_identity' }, () => {
            return (
              <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                <div className="w-full lg:max-w-sm">
                  <div className="bg-background rounded-xl shadow-md p-4 h-full">Service and Expert Info</div>
                </div>

                <div className="w-full lg:flex-1">
                  <div className="bg-background rounded-xl shadow-md p-4 min-h-[300px] md:min-h-[400px]">
                    Booking Session Details
                  </div>
                </div>

                <div className="w-full lg:max-w-sm xl:max-w-md">
                  <div className="bg-background rounded-xl shadow-md p-4 flex flex-col min-h-[200px] md:min-h-[300px] lg:min-h-[400px]">
                    <div className="flex-1 border-b pb-4">
                      <div>Phone Verification Form</div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={() => {
                          setMode({ type: 'verify_identity' })
                        }}
                        className="w-full sm:w-auto"
                      >
                        Send OTP
                      </Button>
                    </div>
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

type Mode =
  | { type: 'select_slot'; backUrl: string }
  | { type: 'verify_identity'; backUrl?: string }
  | { type: 'fill_prebooking_info'; backUrl?: string }
  | { type: 'payment'; backUrl?: string }
