import z from 'zod'
import { useState } from 'react'
import { useTimer } from 'react-timer-hook'
import { match } from 'ts-pattern'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dayjs from '@/lib/dayjs'
import { honoClient } from '@/lib/hono-client'

type Mode = { type: 'initial'; phoneNumber?: string } | { type: 'verify'; phoneNumber: string }

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

export default function PhoneVerificationForm() {
  const [mode, setMode] = useState<Mode>({ type: 'initial' })

  return (
    <div className="space-y-4">
      <div>
        {match(mode)
          .returnType<React.ReactNode>()
          .with({ type: 'initial' }, () => (
            <InitiateVerificationForm
              onSuccess={(phoneNumber) => {
                setMode({ type: 'verify', phoneNumber })
              }}
            />
          ))
          .with({ type: 'verify' }, ({ phoneNumber }) => (
            <VerifyOTP
              phoneNumber={phoneNumber}
              onSuccess={() => {}}
              onBack={() => {
                setMode({ type: 'initial', phoneNumber: mode.phoneNumber })
              }}
            />
          ))
          .otherwise(() => null)}
      </div>
    </div>
  )
}

function InitiateVerificationForm({ onSuccess }: { onSuccess: (phoneNumber: string) => void }) {
  const form = useForm({
    resolver: zodResolver(phoneValidationSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const sendOtpMutation = useMutation({
    mutationFn: initiatePatientAuth,
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
        className="space-y-4 max-w-sm"
        onSubmit={form.handleSubmit((value) => {
          sendOtpMutation.mutate(value.phoneNumber)
        })}
      >
        <div className="text-sm">Verify your phone number to create or access your account</div>
        <FormField
          name="phoneNumber"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Phone Number*</FormLabel>
                <FormControl>
                  <Input autoFocus placeholder="9999988888" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <Button type="submit" disabled={sendOtpMutation.isPending} loading={sendOtpMutation.isPending}>
          {sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
        </Button>
      </form>
    </Form>
  )
}

function VerifyOTP({ phoneNumber, onSuccess }: { phoneNumber: string; onBack: () => void; onSuccess: () => void }) {
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
    mutationFn: initiatePatientAuth,
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
    mutationFn: verifyPatientOtp,
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
        className="space-y-4 max-w-sm"
        onSubmit={form.handleSubmit((value) => {
          verifyOtpMutation.mutate({ otp: value.otp })
        })}
      >
        <div className="text-xl">Verify Phone Number</div>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <div className="space-y-2">
          <Button type="submit" disabled={verifyOtpMutation.isPending} loading={verifyOtpMutation.isPending}>
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
          </Button>
          <div>
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
                  resendOtpMutation.mutate(phoneNumber)
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

const initiatePatientAuth = async (phoneNumber: string) => {
  const res = await honoClient.server.booking.initiate.$post({
    json: { phoneNumber },
  })
  if (!res.ok) {
    throw new Error('Failed to initiate phone verification')
  }
  return res.json()
}

const verifyPatientOtp = async ({ otp }: { otp: string }) => {
  const res = await honoClient.server.booking.verify.$post({
    json: { otp },
  })
  if (!res.ok) {
    throw new Error('Failed to verify OTP')
  }
  return res.json()
}
