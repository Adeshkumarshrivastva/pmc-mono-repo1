import { useState } from 'react'
import { createFileRoute, invariant, redirect } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async ({ context: { authClient } }) => {
    invariant(authClient, 'authClient should be present')
    const session = await authClient?.getSession()
    if (session.data) {
      redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
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
    onSuccess: (data) => {
      console.log('OTP sent successfully', data)
    },
    onError: (error) => {
      console.error('Login failed:', error)
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
    onSuccess: async (data) => {
      console.log('OTP verified successfully', data)
      const session = await authClient?.getSession()
      console.log('session - ', JSON.stringify(session))
    },
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 max-w-sm">
        <Button onClick={() => loginMutation.mutate()}>Send OTP</Button>

        <Input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />

        <Button onClick={() => verifyMutation.mutate()} disabled={!otp || verifyMutation.isPending}>
          Verify OTP
        </Button>

        {loginMutation.error && <p className="text-red-500">{loginMutation.error.message}</p>}
        {verifyMutation.error && <p className="text-red-500">{verifyMutation.error.message}</p>}
      </div>
    </div>
  )
}
