import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
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
import { SERVICE_MODE_CONFIG } from '@/lib/location'

type PrebookingFormProps = {
  serviceId?: string
  expertId?: string
  expertSlug: string
  serviceSlug: string
  phoneNumber: string
  availableModes: BookingLocation[]
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
  expertSlug,
  serviceSlug,
  availableModes,
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
    },
    resolver: zodResolver(prebookingFormSchema),
  })

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (data) => {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway')
        return
      }

      const { patientName, patientEmail } = form.getValues()
      const options = {
        key: env.VITE_PUBLIC_RAZORPAY_KEY_ID,
        amount: Number(data.amount),
        currency: 'INR',
        name: 'Positive Mind Care',
        prefill: { fullName: patientName, email: patientEmail, contact: phoneNumber },
        order_id: data.id,
        modal: {
          escape: false,
          ondismiss: () => {
            toast.error('Payment was not completed. Please try again.')
            navigate({ to: '/experts/$expertSlug/$serviceSlug', params: { expertSlug, serviceSlug }, replace: true })
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
                  <FormLabel>Location*</FormLabel>
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

        {availableModes.length === 1 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            {SERVICE_MODE_CONFIG[availableModes[0]].icon &&
              (() => {
                const Icon = SERVICE_MODE_CONFIG[availableModes[0]].icon!
                return <Icon className="size-4" />
              })()}
            <span className="text-sm font-medium">{SERVICE_MODE_CONFIG[availableModes[0]].label}</span>
          </div>
        )}
        {/* TODO: Render Custom Form Fields of Service */}

        <Button
          loading={createBookingMutation.isPending}
          disabled={createBookingMutation.isPending}
          type="submit"
          className="mt-4"
        >
          Make Payment
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
