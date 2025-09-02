import { z } from 'zod'
import { match } from 'ts-pattern'
import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useTimer } from 'react-timer-hook'
import dayjs from 'dayjs'
import { createFileRoute, invariant, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { Logo } from '@/components/ui/logo'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { env } from '@/lib/env'
import { getErrorMessage } from '@/lib/utils'

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

const phoneValidationSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, {
      message: 'Your phonenumber must be 10 characters.',
    })
    .max(10),
})

const otpValidationSchema = z.object({
  otp: z.string().min(6, { message: 'Your one-time password must be 6 characters.' }),
})

function LoginPage() {
  const loginWithGoogleMutation = useMutation({
    mutationFn: () => {
      return authClient.signIn.social({
        provider: 'google',
        callbackURL: env.VITE_PUBLIC_OAUTH_CALLBACK_URL,
      })
    },
  })

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6 p-4">
        <div className="flex items-center justify-center gap-4">
          <Logo className="size-12" />
          <div className="text-xl font-medium tracking-tight">Positive Mind Care</div>
        </div>
        <Card>
          <CardContent className="space-y-4">
            <OtpLoginForm />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={loginWithGoogleMutation.isPending}
              onClick={() => {
                loginWithGoogleMutation.mutate()
              }}
            >
              Login with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type Mode = { type: 'initial'; phoneNumber?: string } | { type: 'verify'; phoneNumber: string }

function OtpLoginForm() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>({ type: 'initial' })

  return match(mode)
    .returnType<React.ReactNode>()
    .with({ type: 'initial' }, () => (
      <InitiateLoginForm
        onSuccess={(phoneNumber) => {
          setMode({ type: 'verify', phoneNumber })
        }}
      />
    ))
    .with({ type: 'verify' }, ({ phoneNumber }) => (
      <VerifyOTP
        phoneNumber={phoneNumber}
        onSuccess={() => {
          navigate({ to: '/', replace: true })
        }}
        onBack={() => {
          setMode({ type: 'initial', phoneNumber: mode.phoneNumber })
        }}
      />
    ))
    .otherwise(() => null)
}

function InitiateLoginForm({ onSuccess }: { onSuccess: (phoneNumber: string) => void }) {
  const form = useForm({
    resolver: zodResolver(phoneValidationSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const sendOtpMutation = useMutation({
    mutationFn: async (value: z.infer<typeof phoneValidationSchema>) => {
      const res = await authClient.phoneNumber.sendOtp({
        phoneNumber: value.phoneNumber,
      })

      if (res.error) {
        throw new Error(res.error.message)
      }
      return { ...res.data, phoneNumber: value.phoneNumber }
    },
    onSuccess: (data) => {
      toast.success('OTP sent successfully')
      onSuccess(data.phoneNumber)
    },
    onError: (error) => {
      toast.error('Failed to send OTP', {
        description: getErrorMessage(error.message) || 'Please try again later',
      })
    },
  })

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((value) => {
          sendOtpMutation.mutate(value)
        })}
      >
        <FormField
          name="phoneNumber"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="9999988888" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <Button type="submit" className="w-full" disabled={sendOtpMutation.isPending}>
          {sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
        </Button>
      </form>
    </Form>
  )
}

function VerifyOTP({
  phoneNumber,
  onSuccess,
  onBack,
}: {
  phoneNumber: string
  onBack: () => void
  onSuccess: () => void
}) {
  const { seconds, restart } = useTimer({
    expiryTimestamp: dayjs().add(30, 'second').toDate(),
  })

  const form = useForm({
    resolver: zodResolver(otpValidationSchema),
    defaultValues: {
      otp: '',
    },
  })

  const resendOtpMutation = useMutation({
    mutationFn: async (value: z.infer<typeof phoneValidationSchema>) => {
      const res = await authClient.phoneNumber.sendOtp({
        phoneNumber: value.phoneNumber,
      })

      if (res.error) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      restart(dayjs().add(30, 'second').toDate())
      toast.success('OTP sent successfully')
    },
    onError: (error) => {
      toast.error('Failed to send OTP', {
        description: getErrorMessage(error.message) || 'Please try again later',
      })
    },
  })

  const verifyOtpMutation = useMutation({
    mutationFn: async (value: z.infer<typeof otpValidationSchema>) => {
      const res = await authClient.phoneNumber.verify({
        phoneNumber: phoneNumber,
        code: value.otp,
      })

      if (res.error) {
        throw new Error(res.error.message)
      }
      return res.data
    },
    onSuccess: () => {
      toast.success('Login successful')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Verification failed', {
        description: getErrorMessage(error),
      })
    },
  })

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((value) => {
          verifyOtpMutation.mutate(value)
        })}
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to</p>
          <p className="font-medium">+91 {phoneNumber}</p>
        </div>
        <FormField
          name="otp"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} onChange={field.onChange} value={field.value}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onClick={() => {
                onBack()
              }}
            >
              Change number
            </Button>

            {seconds > 0 ? (
              <p className="text-xs">
                Resend OTP in <strong>{seconds}</strong> seconds
              </p>
            ) : (
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => {
                  resendOtpMutation.mutate({ phoneNumber })
                }}
                disabled={resendOtpMutation.isPending || seconds > 0 || resendOtpMutation.status === 'error'}
              >
                {resendOtpMutation.isPending ? 'Resending...' : 'Resend OTP'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
