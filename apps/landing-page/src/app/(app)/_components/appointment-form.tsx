'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { appointmentFormInput, type AppointmentFormInput } from '@/payload/actions/appointments/appointments.input'
import { completeTrialSessionAppointment } from '@/payload/actions/appointments/appointments.actions'
import { createTrialSessionOrder } from '@/payload/actions/payments/payments.action'
import { env } from '@/env'
import { TRIAL_SESSION_AMOUNT } from '@/lib/constants'

declare global {
  interface Window {
    Razorpay: any
  }
}

type AppointmentFormProps = {
  trigger: React.ReactNode
}

export default function AppointmentForm({ trigger }: AppointmentFormProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-primary-foreground">
        <DialogHeader>
          <DialogTitle>Book Trial Session</DialogTitle>
          <DialogDescription>
            Fill out the form below, and we&apos;ll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <InputForm />
      </DialogContent>
    </Dialog>
  )
}

function InputForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => setIsScriptLoaded(false)
    document.body.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
      script.parentNode?.removeChild(script)
    }
  }, [])

  const form = useForm<AppointmentFormInput>({
    defaultValues: {
      fullName: '',
      phone: '',
      serviceId: '',
      subServiceId: '',
      dateTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16),
      amount: String(TRIAL_SESSION_AMOUNT),
    },
    resolver: zodResolver(appointmentFormInput),
  })

  async function onSubmit(values: AppointmentFormInput) {
    if (!isScriptLoaded || !window.Razorpay) {
      toast.error('Payment is still loading. Please try again in a moment.')
      return
    }

    const key = env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!key) {
      toast.error('Online payment is currently unavailable. Please contact us for assistance.')
      return
    }

    setIsSubmitting(true)
    try {
      const { orderId } = await createTrialSessionOrder()
      const checkout = new window.Razorpay({
        key,
        amount: TRIAL_SESSION_AMOUNT * 100,
        currency: 'INR',
        name: 'Positive Mind Care',
        description: 'Trial Session Booking',
        order_id: orderId,
        prefill: {
          name: values.fullName,
          email: values.email || undefined,
          contact: values.phone,
        },
        theme: {
          color: '#3399cc',
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            await completeTrialSessionAppointment({
              appointment: { ...values, amount: String(TRIAL_SESSION_AMOUNT) },
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })
            toast.success('Payment successful. Your trial session request is booked.')
            form.reset()
          } catch (error) {
            console.error('Failed to complete paid trial session booking:', error)
            toast.error('Payment was received, but the booking could not be confirmed. Please contact support.')
          } finally {
            setIsSubmitting(false)
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      })

      checkout.open()
    } catch (error) {
      console.error('Failed to start trial session payment:', error)
      toast.error('Could not start payment. Please try again.', {
        description: error instanceof Error ? error.message : undefined,
      })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="border border-border rounded-xl p-4 sm:p-6 lg:p-8">
      <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-center font-semibold text-primary">
        Trial session fee: ₹{TRIAL_SESSION_AMOUNT}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="col-span-1">
          <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Your Name
          </label>
          <input
            {...form.register('fullName')}
            name="fullName"
            type="text"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your name"
          />
          {form.formState.errors.fullName ? (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="col-span-1">
          <label htmlFor="phone" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Phone Number
          </label>
          <input
            {...form.register('phone')}
            name="phone"
            type="tel"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your phone"
          />
          {form.formState.errors.phone ? (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>

        <div className="col-span-full">
          <label htmlFor="email" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Email Address
          </label>
          <input
            {...form.register('email')}
            name="email"
            type="email"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your email"
          />
          {form.formState.errors.email ? (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="col-span-full">
          <label htmlFor="dateTime" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Date and Time
          </label>
          <input
            {...form.register('dateTime')}
            type="datetime-local"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {form.formState.errors.dateTime ? (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.dateTime.message}</p>
          ) : null}
        </div>

        <div className="col-span-full sm:col-span-2 pt-2">
          <Button
            type="submit"
            className="w-full py-3 text-sm font-semibold tracking-wider hover:bg-primary/90 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing payment…' : `Pay ₹${TRIAL_SESSION_AMOUNT} and Book`}
          </Button>
        </div>
      </div>
    </form>
  )
}
