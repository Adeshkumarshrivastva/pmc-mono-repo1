import { createFileRoute } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'

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
  return <div>Booking confirmation page</div>
}
