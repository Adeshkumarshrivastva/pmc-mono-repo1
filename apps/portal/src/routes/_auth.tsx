import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  beforeLoad: () => {},
  pendingComponent: () => {
    return (
      <div className="h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  },
})

function AuthLayout() {
  return <Outlet />
}
