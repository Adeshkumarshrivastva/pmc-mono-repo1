import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import type { PaymentMode } from '@pmc/server/src/generated/prisma/client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BOOKING_LOCATION, type BookingLocation } from '@/lib/booking'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { honoClient } from '@/lib/hono-client'
import { getErrorMessage, invariant } from '@/lib/utils'
import { useBooking } from '../-hooks/use-booking'
import { env } from '@/lib/env'
import { loadRazorpayScript } from '@/lib/razorpay'
import { SERVICE_MODE_CONFIG } from '@/lib/service'
import { CURRENCY_CONFIG } from '@/lib/booking'

type PrebookingFormProps = {
  serviceId?: string
  expertId?: string
  expertSlug: string
  serviceSlug: string
  phoneNumber: string
  availableModes: BookingLocation[]
  paymentMode: PaymentMode
  price: number
  currency: string
  patientName?: string
  patientEmail?: string
}

const prebookingFormSchema = z.object({
  patientName: z.string({ message: 'Patient Name is required' }).min(3).max(100),
  patientEmail: z.email().optional().or(z.literal('')),
  serviceMode: z.enum(BOOKING_LOCATION),
})

export default function PrebookingForm({
  serviceId,
  expertId,
  phoneNumber,
  availableModes,
  paymentMode,
  price,
  currency,
  patientName,
  patientEmail,
}: PrebookingFormProps) {
  invariant(serviceId, 'service id must be present')
  invariant(expertId, 'expert Id must be present')

  const navigate = useNavigate()
  const { getSelectedSlot } = useBooking()

  const selectedSlot = getSelectedSlot()
  invariant(selectedSlot, 'selectedSlot must be present')

  const form = useForm({
    defaultValues: {
      serviceMode: availableModes[0],
      patientName: patientName || '',
      patientEmail: patientEmail || '',
    },
    resolver: zodResolver(prebookingFormSchema),
  })

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (data) => {
      if (data.paymentMode === 'ONLINE' && data.razorpayOrder) {
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway')
          return
        }

        const { patientName, patientEmail } = form.getValues()
        const options = {
          key: env.VITE_PUBLIC_RAZORPAY_KEY_ID,
          amount: Number(data.razorpayOrder.amount),
          currency: 'INR',
          name: 'Positive Mind Care',
          prefill: { fullName: patientName, email: patientEmail, contact: phoneNumber },
          order_id: data.razorpayOrder.id,
          modal: {
            escape: false,
            ondismiss: () => {
              toast.error('Payment was not completed. Please try again.')
              window.location.reload()
            },
          },
          handler: () => {
            navigate({
              to: '/bookings/$bookingId',
              params: {
                bookingId: data.bookingId,
              },
              replace: true,
              reloadDocument: true,
            })
          },
          description: 'Payment for service booking',
          theme: {
            color: '#385246',
          },
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      } else {
        toast.success('Booking created successfully!')
        navigate({
          to: '/bookings/$bookingId',
          params: {
            bookingId: data.bookingId,
          },
          replace: true,
          reloadDocument: true,
        })
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values: z.infer<typeof prebookingFormSchema>) => {
          createBookingMutation.mutate({
            formInput: values,
            serviceId: serviceId,
            expertId: expertId,
            startDateTime: `${selectedSlot.toJSON()}`,
          })
        })}
      >
        <FormField
          name="patientName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Patient Name*</FormLabel>
                <FormControl>
                  <Input autoFocus placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          name="patientEmail"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Patient Email</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
              </FormItem>
            )
          }}
        />
        {availableModes.length > 1 && (
          <FormField
            name="serviceMode"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col">
                      {availableModes.map((mode) => {
                        const Icon = SERVICE_MODE_CONFIG[mode].icon
                        return (
                          <FormItem key={SERVICE_MODE_CONFIG[mode].value} className="flex items-center gap-3">
                            <FormControl>
                              <RadioGroupItem value={SERVICE_MODE_CONFIG[mode].value} />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center gap-2">
                              {Icon && <Icon className="size-4" />}
                              {SERVICE_MODE_CONFIG[mode].label}
                            </FormLabel>
                          </FormItem>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )
            }}
          />
        )}

        {/* TODO: Render Custom Form Fields of Service */}

        <div className="p-4 bg-accent border rounded-md text-sm text-primary">
          <p className="font-medium">Payment Information:</p>
          <p className="mt-1">
            Amount:{' '}
            <span className="font-semibold">
              {CURRENCY_CONFIG[currency].symbol}
              {price}
            </span>
          </p>
          {paymentMode === 'OFFLINE' ? (
            <p className="mt-1">The payment will be made on-site at the appointment location.</p>
          ) : (
            <p className="mt-1">You will be redirected to a secure payment gateway to complete your booking.</p>
          )}
        </div>

        <Button
          loading={createBookingMutation.isPending}
          disabled={createBookingMutation.isPending}
          type="submit"
          className="mt-4"
        >
          {paymentMode === 'ONLINE' ? 'Pay & Schedule' : 'Book Now'}
        </Button>
      </form>
    </Form>
  )
}

type CreateBookingInput = {
  formInput: z.infer<typeof prebookingFormSchema>
  expertId: string
  serviceId: string
  startDateTime: string
}

async function createBooking({ formInput, expertId, serviceId, startDateTime }: CreateBookingInput) {
  const res = await honoClient.server.booking.create.$post({
    json: {
      patientName: formInput.patientName,
      patientEmail: formInput?.patientEmail,
      mode: formInput.serviceMode,
      expertId,
      serviceId,
      startDateTime,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to create booking')
  }

  return res.json()
}
