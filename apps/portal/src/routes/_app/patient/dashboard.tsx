import { createFileRoute } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/_app/patient/dashboard')({
  component: PatientDashboard,
  pendingComponent: () => {
    return (
      <div className="h-full flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  },
})

function PatientDashboard() {
  return <div>Patient Dashboard</div>
}
