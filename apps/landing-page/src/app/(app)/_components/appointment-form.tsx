'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
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
import { appointmentFormInput, AppointmentFormInput } from '@/payload/actions/appointments/appointments.input'
import { createAppointment } from '@/payload/actions/appointments/appointments.actions'

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
  const form = useForm<AppointmentFormInput>({
    defaultValues: {
      fullName: '',
      phone: '',
      serviceId: '',
      subServiceId: '',
      dateTime: new Date().toLocaleString(),
      amount: 0,
    },
    resolver: zodResolver(appointmentFormInput),
  })

  const appointmentFormMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      toast('Thank you for your interest!', {
        description: 'We will get back to you as soon as possible.',
      })
      form.reset()
    },
    onError: () => {
      toast('Failed to submit the form. Please try again later.', {
        description: 'If the problem persists, please contact us directly.',
      })
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit(
        (values) => {
          appointmentFormMutation.mutate(values)
        },
        (errors) => {
          console.log('Form errors:', errors)
        },
      )}
      className="border border-border rounded-xl p-4 sm:p-6 lg:p-8"
    >
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
        </div>

        <div className="col-span-full">
          <label htmlFor="email" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Email Address
          </label>
          <input
            {...form.register('email')}
            name="email"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Enter your email"
          />
        </div>

        <div className="col-span-full">
          <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
            Date and Time
          </label>
          <input
            {...form.register('dateTime')}
            type="datetime-local"
            className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="col-span-full sm:col-span-2 pt-2">
          <Button
            type="submit"
            className="w-full py-3 text-sm font-semibold tracking-wider hover:bg-primary/90 transition-colors"
            disabled={appointmentFormMutation.isPending}
          >
            Make Appointment
          </Button>
        </div>
      </div>
    </form>
  )
}
