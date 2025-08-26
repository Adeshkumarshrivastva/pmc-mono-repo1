import { useQuery } from '@tanstack/react-query'
import { createFileRoute, invariant, redirect } from '@tanstack/react-router'
import { honoClient } from '@/lib/hono-client'

export const Route = createFileRoute('/_app/')({
  beforeLoad: async ({ context: { authClient } }) => {
    invariant(authClient, 'authClient should be present')
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({ to: '/login' })
    }
    return { session: session.data }
  },
  component: DashboardPage,
})

export default function DashboardPage() {
  const getCurrentUserQuery = useQuery({
    queryKey: ['get-current-user'],
    queryFn: fetchCurrentUser,
  })

  return (
    <div>
      <div>Dashboard Page</div>
      <p>{getCurrentUserQuery.data ? JSON.stringify(getCurrentUserQuery.data) : null}</p>
    </div>
  )
}

const fetchCurrentUser = async () => {
  const res = await honoClient.server.user.me.$get()
  const user = await res.json()
  return user
}
