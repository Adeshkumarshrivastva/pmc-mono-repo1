import { createFileRoute, redirect } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/_app/expert/dashboard')({
  component: ExpertDashboard,
  beforeLoad: ({ context: { user } }) => {
    if (user.role === 'PATIENT') {
      throw redirect({ to: '/patient/dashboard' })
    }
  },
  pendingComponent: () => {
    return (
      <div className="h-full flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  },
})

function ExpertDashboard() {
  return <div>Expert Dashboard (Coming soon)</div>
}
