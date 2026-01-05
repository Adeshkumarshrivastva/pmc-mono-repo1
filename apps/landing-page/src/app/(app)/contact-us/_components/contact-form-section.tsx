'use client'

import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { useMutation } from '@tanstack/react-query'
import type { ContactUs, Service } from '@/payload/types'
import { Button } from '@/components/ui/button'
import { leadFormInput, type LeadFormInput } from '@/payload/actions/leads/leads.input'
import { createLead } from '@/payload/actions'

type ContactFormSectionProps = {
  data: ContactUs['contactUs']
  services: Service[]
}

export default function ContactFormSection({ data, services }: ContactFormSectionProps) {
  const form = useForm<LeadFormInput>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    },
    resolver: zodResolver(leadFormInput),
  })

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
    <section className="w-full flex-1 bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">{data?.title}</h2>
              <div className="lg:text-lg">{data?.subtitle}</div>
              {data?.description ? <RichText data={data.description} className="mt-24" /> : null}
            </div>
            <div className="w-full lg:w-auto lg:min-w-[400px] xl:min-w-[450px]">
              <form
                onSubmit={form.handleSubmit((values) => {
                  contactFormMutation.mutate(values)
                })}
                className="bg-primary border border-border rounded-xl p-4 sm:p-6 lg:p-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-primary-foreground text-xs font-semibold mb-2">
                      Full name
                    </label>
                    <input
                      {...form.register('fullName')}
                      type="text"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="phone" className="block text-primary-foreground text-xs font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      {...form.register('phone')}
                      type="tel"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Ex. +91 9012 8934 78"
                    />
                  </div>

                  <div className="col-span-full">
                    <label htmlFor="email" className="block text-primary-foreground text-xs font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      {...form.register('email')}
                      type="email"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* <div className="col-span-full">
                    <label htmlFor="name" className="block text-primary-foreground text-xs font-semibold mb-2">
                      Service
                    </label>
                    <select
                      {...form.register('serviceId')}
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value={''}>Select Service</option>
                      {services?.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  <div className="col-span-full sm:col-span-2">
                    <label htmlFor="message" className="block text-primary-foreground text-xs font-semibold mb-2">
                      Tell us your message
                    </label>
                    <textarea
                      {...form.register('message')}
                      rows={4}
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <div className="col-span-full sm:col-span-2 pt-2">
                    <Button
                      type="submit"
                      disabled={contactFormMutation.isPending || contactFormMutation.isSuccess}
                      variant="secondary"
                      className="w-full py-3 text-sm font-semibold transition-colors"
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
