import { createFileRoute, redirect } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/_app/patient/bookings/')({
  component: PatientBookings,
  beforeLoad: ({ context: { user } }) => {
    if (user.role === 'EXPERT') {
      throw redirect({ to: '/expert/dashboard' })
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

function PatientBookings() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div>Patient Bookings Page</div>
    </div>
  )
}
