import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, invariant, redirect, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/utils'

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
  const navigation = useNavigate()
  const getCurrentUserQuery = useQuery({
    queryKey: ['get-current-user'],
    queryFn: fetchCurrentUser,
  })

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut()
    },
    onSuccess: () => {
      toast.success('Signed out successfully')
      navigation({ to: '/login', replace: true })
    },
    onError: (error) => {
      toast.error('Failed to sign out', {
        description: getErrorMessage(error),
      })
    },
  })

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div>Dashboard Page</div>
      <p className="max-w-2xl">{getCurrentUserQuery.data ? JSON.stringify(getCurrentUserQuery.data, null, 2) : null}</p>
      <Button
        disabled={signOutMutation.isPending}
        onClick={() => {
          signOutMutation.mutate()
        }}
      >
        Sign out
      </Button>
    </div>
  )
}

const fetchCurrentUser = async () => {
  const res = await honoClient.server.user.me.$get()
  const user = await res.json()
  return user
}
