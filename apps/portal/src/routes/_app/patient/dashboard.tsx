import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/utils'

export const Route = createFileRoute('/_app/patient/dashboard')({
  component: PatientDashboard,
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

function PatientDashboard() {
  const { user } = Route.useLoaderData()
  const navigate = useNavigate()
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut()
    },
    onSuccess: () => {
      toast.success('Signed out successfully')
      navigate({ to: '/login', replace: true })
    },
    onError: (error) => {
      toast.error('Failed to sign out', {
        description: getErrorMessage(error),
      })
    },
  })

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div>Patient Dashboard Page</div>
      <p className="max-w-2xl">{user ? JSON.stringify(user, null, 2) : null}</p>
      <Button
        disabled={signOutMutation.isPending}
        loading={signOutMutation.isPending}
        onClick={() => {
          signOutMutation.mutate()
        }}
      >
        Sign out
      </Button>
    </div>
  )
}
