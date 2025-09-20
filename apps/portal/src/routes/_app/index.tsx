import { createFileRoute, redirect } from '@tanstack/react-router'
import { CURRENT_SESSION_QUERY_KEY, getUserSession } from '@/queries/session'

export const Route = createFileRoute('/_app/')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData({
      queryKey: CURRENT_SESSION_QUERY_KEY,
      queryFn: getUserSession,
    })
    if (!session.data) {
      throw redirect({ to: '/login' })
    }

    if (session.data.user.role === 'EXPERT') {
      throw redirect({ to: '/expert/dashboard' })
    }
    if (session.data.user.role === 'PATIENT') {
      throw redirect({ to: '/patient/dashboard' })
    }

    return { session: session.data }
  },
  component: () => null,
})
