'use client'

import { match, P } from 'ts-pattern'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from '@/components/ui/icons'
import { Home, Service } from '@/payload/types'
import { Button } from '@/components/ui/button'
import { AppointmentFormInput, appointmentFormInput } from '@/payload/actions/appointments/appointments.input'
import { createAppointment } from '@/payload/actions/appointments/appointments.actions'
import { env } from '@/env'

type AppointmentSectionProps = {
  data: Home['appointmentSection']
  services: Service[]
}

export default function AppointmentSection({ data, services }: AppointmentSectionProps) {
  const appointmentData = data?.appointmentSection
  const router = useRouter()

  const form = useForm<AppointmentFormInput>({
    defaultValues: {
      fullName: '',
      phone: '',
      serviceId: '',
      subServiceId: '',
      message: '',
      amount: '1000',
      dateTime: new Date().toLocaleString(),
    },
    resolver: zodResolver(appointmentFormInput),
  })

  const serviceId = useWatch({ control: form.control, name: 'serviceId' })
  const subServices = services.find((service) => service.id === serviceId)?.subservices?.docs ?? []

  const appointmentFormMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: (data) => {
      const { fullName, email, phone, dateTime } = form.getValues()
      const options = {
        key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? 'rzp_live_rmfc3SEgWtvd52',
        amount: Number(data.amount) * 100,
        currency: 'INR',
        order_id: data.orderId,
        name: 'Appointment Booking',
        prefill: { fullName, email, phone, dateTime },
        modal: {
          escape: false,
          ondismiss: () => {
            toast.error('Payment was not completed. Please try again.')
          },
        },
        handler: () => {
          router.push(`/appointment-success?appointmentId=${data.appointmentId}`)
        },
        description: 'Payment for appointment booking',
        theme: {
          color: '#385246',
        },
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    },
    onError: () => {
      toast('Failed to submit the form. Please try again later.', {
        description: 'If the problem persists, please contact us directly.',
      })
    },
  })

  return (
    <section className="w-full bg-primary px-4 py-8 sm:px-6 sm:py-12 md:px-8 lg:px-12" id="appointement-section">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-primary-foreground rounded-xl border border-border p-4 sm:p-8 xl:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-24">
            <div className="flex flex-col h-full mb-8 lg:mb-0">
              <div className="space-y-4 sm:space-y-6 flex-1">
                <div className="text-primary text-xs sm:text-sm font-bold tracking-wider">APPOINTMENT</div>

                <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                  {appointmentData?.title}
                </h2>

                <div className="flex flex-col md:flex-row sm:justify-between gap-6 sm:gap-4 pt-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Our Contact</h3>
                    <div className="space-y-2">
                      {appointmentData?.contacts?.map((contact, index) => (
                        <div key={index} className="text-muted-foreground font-medium text-sm sm:text-base">
                          <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">
                            {contact.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Location</h3>
                    <div className="text-muted-foreground font-medium text-sm sm:text-base">
                      {appointmentData?.location}
                    </div>
                  </div>
                </div>
              </div>

              {appointmentData?.socialMediaLinks && appointmentData?.socialMediaLinks?.length > 0 && (
                <div className="flex items-center space-x-3 sm:space-x-4 pt-4 lg:pt-0">
                  {appointmentData?.socialMediaLinks.map((platform, index) => (
                    <a href={platform.url ?? ''} target="_blank" key={index}>
                      {match(platform.socialMediaPlatform)
                        .returnType<React.ReactNode>()
                        .with('facebook', () => <FacebookIcon className="text-primary/60 h-8 w-8 " />)
                        .with('instagram', () => <InstagramIcon className="text-primary/60 h-8 w-8 " />)
                        .with('x', () => <TwitterIcon className="text-primary/60 h-8 w-8" />)
                        .with('linkedin', () => <LinkedinIcon className="text-primary/60 h-8 w-8" />)
                        .with(P._, () => null)
                        .exhaustive()}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full">
              <form
                onSubmit={form.handleSubmit((values) => {
                  appointmentFormMutation.mutate(values)
                })}
                className="bg-primary-foreground border border-border rounded-xl p-4 sm:p-6 lg:p-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Full name <span className="text-error">*</span>
                    </label>
                    <input
                      {...form.register('fullName')}
                      type="text"
                      className="text-sm w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="phone" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Phone Number <span className="text-error">*</span>
                    </label>
                    <input
                      {...form.register('phone')}
                      type="tel"
                      className="text-sm w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="+91 12345 67890"
                    />
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="email" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      {...form.register('email')}
                      type="email"
                      className="text-sm w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Service <span className="text-error">*</span>
                    </label>
                    <select
                      {...form.register('serviceId')}
                      className="text-sm w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value={''}>Select Service</option>
                      {services?.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Sub Service
                    </label>
                    <select
                      {...form.register('subServiceId')}
                      className="text-sm w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value={''}>Select Sub Service</option>
                      {subServices.map((service) => {
                        if (typeof service === 'string') {
                          return null
                        }

                        return (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Date and Time <span className="text-error">*</span>
                    </label>
                    <input
                      {...form.register('dateTime')}
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      className="text-sm w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="phone" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Amount <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground pointer-events-none">
                        ₹
                      </span>

                      <input
                        {...form.register('amount')}
                        id="amount"
                        type="number"
                        className="text-sm w-full border border-border rounded-lg pl-6 pr-3 py-3
                 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="1000"
                      />
                    </div>
                  </div>

                  <div className="col-span-full sm:col-span-2">
                    <label
                      htmlFor="message"
                      className="block text-muted-foreground uppercase text-xs font-semibold mb-2"
                    >
                      Tell us your message
                    </label>
                    <textarea
                      {...form.register('message')}
                      rows={4}
                      className="text-sm w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <div className="col-span-full sm:col-span-2 pt-2">
                    <Button
                      type="submit"
                      disabled={appointmentFormMutation.isPending}
                      variant="secondary"
                      className="inline-flex items-center justify-center space-x-2 rounded-lg cursor-pointer bg-primary text-primary-foreground disabled:pointer-events-none disabled:opacity-50 h-12 px-4 w-full py-3 text-sm font-semibold tracking-wider hover:bg-primary/90 transition-colors"
                    >
                      Confirm & Pay
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
