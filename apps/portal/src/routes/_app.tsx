import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Spinner } from '@/components/ui/spinner'
import AppShell from '@/components/app-shell'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  beforeLoad: async ({ context: { sessionData } }) => {
    if (!sessionData.data) {
      throw redirect({ to: '/login' })
    }
    return { user: sessionData.data.user }
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

function AppLayout() {
  const { user } = Route.useLoaderData()

  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  )
}
