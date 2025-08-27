import { z } from 'zod'
import { createFileRoute, invariant, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { Logo } from '@/components/ui/logo'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

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
        callbackURL: 'http://localhost:5173/portal',
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
          <CardContent className="space-y-4 pt-6">
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

function OtpLoginForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'send' | 'verify'>('send')
  const sendOtpForm = useForm({
    resolver: zodResolver(phoneValidationSchema),
    defaultValues: {
      phoneNumber: '',
    },
  })

  const phoneNumber = useWatch({ control: sendOtpForm.control, name: 'phoneNumber' })

  const verifyOtpForm = useForm({
    resolver: zodResolver(otpValidationSchema),
    defaultValues: {
      otp: '',
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
      return res.data
    },
    onSuccess: () => {
      setStep('verify')
      //TODO: add toast
    },
    onError: () => {
      // TODO: Add toast
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
      navigate({ to: '/', replace: true })
      //TODO: add toast
    },
    onError: () => {
      // TODO: Add toast
    },
  })

  const handleBackToPhone = () => {
    setStep('send')
  }

  const handleResendOtp = () => {
    sendOtpMutation.mutate({ phoneNumber })
  }

  if (step === 'send') {
    return (
      <Form {...sendOtpForm}>
        <form
          className="space-y-4"
          onSubmit={sendOtpForm.handleSubmit((value) => {
            sendOtpMutation.mutate(value)
          })}
        >
          <FormField
            name="phoneNumber"
            control={sendOtpForm.control}
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

  return (
    <Form {...verifyOtpForm}>
      <form
        className="space-y-4"
        onSubmit={verifyOtpForm.handleSubmit((value) => {
          verifyOtpMutation.mutate(value)
        })}
      >
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to</p>
          <p className="font-medium">+91 {phoneNumber}</p>
        </div>
        <FormField
          name="otp"
          control={verifyOtpForm.control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
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
                <FormDescription>Please enter the one-time password sent to your phone.</FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
            {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <div className="flex justify-between text-sm">
            <Button type="button" variant="link" className="p-0 h-auto" onClick={handleBackToPhone}>
              Change number
            </Button>

            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onClick={handleResendOtp}
              disabled={sendOtpMutation.isPending}
            >
              {sendOtpMutation.isPending ? 'Resending...' : 'Resend OTP'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
