import { z } from 'zod'
import { match } from 'ts-pattern'
import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useTimer } from 'react-timer-hook'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CURRENT_SESSION_QUERY_KEY } from '@/queries/session'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { Logo } from '@/components/ui/logo'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { getErrorMessage, invariant } from '@/lib/utils'
import dayjs from '@/lib/dayjs'
import PhoneInput from '@/components/ui/phone-input'

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: async () => {
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
    .min(12, {
      message: 'Your phonenumber must be 10 characters.',
    })
    .max(12),
})

const otpValidationSchema = z.object({
  otp: z.string().min(6, { message: 'Your one-time password must be 6 characters.' }),
})

function LoginPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-primary">
      <div className="flex w-full max-w-sm flex-col gap-6 p-4">
        <div className="flex items-center justify-center gap-4 text-white">
          <Logo className="size-12" />
          <div className="text-xl font-medium tracking-tight">Positive Mind Care</div>
        </div>
        <Card>
          <CardContent className="space-y-4">
            <OtpLoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type Mode = { type: 'initial'; phoneNumber?: string } | { type: 'verify'; phoneNumber: string }

function OtpLoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
        onSuccess={async () => {
          await queryClient.invalidateQueries({ queryKey: CURRENT_SESSION_QUERY_KEY })
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
        <div className="text-center">
          <div className="font-semibold">Login or Sign up</div>
          <div className="text-xs">We will send a code (via SMS & Whatsapp) to your mobile number</div>
        </div>
        <FormField
          name="phoneNumber"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <PhoneInput autoFocus autoComplete="off" placeholder="Enter your mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={sendOtpMutation.isPending}
          loading={sendOtpMutation.isPending}
        >
          Continue
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
      form.reset()
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
        <div className="text-center">
          <div className="font-semibold">Verify your number</div>
          <div className="text-xs">Please enter the OTP sent to your mobile number +{phoneNumber}</div>
        </div>
        <FormField
          name="otp"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP autoFocus maxLength={6} onChange={field.onChange} value={field.value}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={verifyOtpMutation.isPending}
            loading={verifyOtpMutation.isPending}
          >
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
