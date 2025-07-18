'use client'

import { match, P } from 'ts-pattern'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from '@/components/ui/icons'
import { Home, Service } from '@/payload/types'
import { Button } from '@/components/ui/button'
import { createLead, leadFormInput, LeadFormInput } from '@/payload/actions'

type AppointmentSectionProps = {
  data: Home['appointmentSection']
  services: Service[]
}

export default function AppointmentSection({ data, services }: AppointmentSectionProps) {
  const appointmentData = data?.appointmentSection

  const form = useForm<LeadFormInput>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      serviceId: '',
      subServiceId: '',
      message: '',
    },
    resolver: zodResolver(leadFormInput),
  })

  const serviceId = useWatch({ control: form.control, name: 'serviceId' })
  const subServices = services.find((service) => service.id === serviceId)?.subservices?.docs ?? []

  const contactFormMutation = useMutation({
    mutationFn: createLead,
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
    <section className="w-full bg-primary py-8 px-4 sm:py-12 sm:px-6 lg:px-28" id="appointement-section">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-primary-foreground rounded-xl border border-border p-4 sm:p-8 lg:p-16 min-h-[600px] lg:h-[700px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            <div className="flex flex-col h-full mb-8 lg:mb-0">
              <div className="space-y-4 sm:space-y-6 flex-1">
                <div className="text-primary text-xs sm:text-sm font-bold tracking-wider">APPOINTMENT</div>

                <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                  {appointmentData?.title}
                </h2>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-6 sm:gap-4 pt-4">
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
                        .with('facebook', () => <FacebookIcon className="text-primary h-8 w-8 " />)
                        .with('instagram', () => <InstagramIcon className="text-primary h-8 w-8 " />)
                        .with('x', () => <TwitterIcon className="text-primary h-8 w-8" />)
                        .with('linkedin', () => <LinkedinIcon className="text-primary h-8 w-8" />)
                        .with(P._, () => null)
                        .exhaustive()}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full lg:w-auto lg:min-w-[400px] xl:min-w-[450px]">
              <form
                onSubmit={form.handleSubmit((values) => {
                  contactFormMutation.mutate(values)
                })}
                className="bg-primary-foreground border border-border rounded-xl p-4 sm:p-6 lg:p-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Full name
                    </label>
                    <input
                      {...form.register('fullName')}
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
                      type="tel"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Ex. +91 9012 8934 78"
                    />
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="email" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      {...form.register('email')}
                      type="email"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Service
                    </label>
                    <select
                      {...form.register('serviceId')}
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <div className="col-span-full sm:col-span-2 pt-2">
                    <Button
                      type="submit"
                      disabled={contactFormMutation.isPending || contactFormMutation.isSuccess}
                      variant="secondary"
                      className="inline-flex items-center justify-center space-x-2 rounded-lg cursor-pointer bg-primary text-primary-foreground disabled:pointer-events-none disabled:opacity-50 h-12 px-4 w-full py-3 text-sm font-semibold tracking-wider hover:bg-primary/90 transition-colors"
                    >
                      Submit
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
