import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { CURRENT_SESSION_QUERY_KEY, getUserSession } from '@/queries/session'
import { Spinner } from '@/components/ui/spinner'
import AppShell from '@/components/app-shell'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData({
      queryKey: CURRENT_SESSION_QUERY_KEY,
      queryFn: getUserSession,
    })
    if (!session.data) {
      throw redirect({ to: '/login' })
    }
    return { user: session.data.user }
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
