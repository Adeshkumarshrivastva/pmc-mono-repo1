import { useState } from 'react'
import { createFileRoute, invariant, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async ({ context: { authClient } }) => {
    invariant(authClient, 'authClient should be present')
    const session = await authClient?.getSession()
    if (session.data) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [phoneNumber] = useState('+918076332196') // You might want to make this dynamic

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      })

      if (res.error) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      //TODO: add toast
    },
    onError: () => {
      // TODO: Add toast
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.phoneNumber.verify({
        phoneNumber,
        code: otp,
        disableSession: false,
      })

      if (res.error) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      // TODO: Add toast
      navigate({ to: '/', replace: true })
    },
    onError: () => {
      // TODO: Add toast
    },
  })

  const loginWithGoogleMutation = useMutation({
    mutationFn: () => {
      return authClient.signIn.social({
        provider: 'google',
        callbackURL: 'http://localhost:5173/portal',
      })
    },
  })

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2 max-w-sm">
          <Button onClick={() => loginMutation.mutate()}>Send OTP</Button>

          <Input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />

          <Button onClick={() => verifyMutation.mutate()} disabled={!otp || verifyMutation.isPending}>
            Verify OTP
          </Button>
          <p>Or</p>
          <Button
            disabled={loginWithGoogleMutation.isPending}
            onClick={() => {
              loginWithGoogleMutation.mutate()
            }}
          >
            Login with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
