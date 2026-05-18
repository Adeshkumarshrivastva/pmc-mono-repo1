'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { createLead } from '@/payload/actions'

const bookingFormSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  numberOfPeople: z.string().min(1, 'Number of people is required'),
  sharingType: z.enum(['single', 'double']),
  bookingDate: z.string().min(1, 'Date is required'),
  message: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingFormSchema>

export default function OutingBookingForm() {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      numberOfPeople: '1',
      sharingType: 'double',
      bookingDate: '',
      message: '',
    },
  })

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      
      const bookingDetails = `
Outing Booking Request:
- Number of People: ${data.numberOfPeople}
- Sharing Type: ${data.sharingType === 'single' ? 'Single Sharing' : 'Double Sharing'}
- Booking Date: ${data.bookingDate}
${data.message ? `- Additional Message: ${data.message}` : ''}
      `.trim()

      const leadData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        service: 'Outing Booking',
        message: bookingDetails,
      }

      return createLead(leadData)
    },
    onSuccess: () => {
      toast.success('Booking request submitted!', {
        description: 'Our team will contact you shortly to confirm your booking.',
      })
      form.reset()
    },
    onError: (error) => {
      console.error('Outing booking submission error:', error)
      toast.error('Failed to submit booking request', {
        description: 'Please try again later or contact us directly.',
      })
    },
  })

  return (
    <section className="w-full flex-1 bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Left: Outing Info */}
            <div className="space-y-6">
              <Link href="/" className="inline-block text-primary hover:underline mb-4">
                ← Back to Home
              </Link>
              
              <h2 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">
                Book Your Outing
              </h2>
              
              <div className="text-lg text-foreground space-y-4">
                <p>
                  Join us for a refreshing mental health wellness outing designed to promote relaxation, 
                  connection, and personal growth in a supportive environment.
                </p>
                <p>
                  Our outings provide a perfect opportunity to step away from daily stress and engage 
                  in meaningful activities that nurture your mental well-being.
                </p>
              </div>

              <div className="mt-8 space-y-4 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Quick response from our team
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Booking confirmation via call
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Professional guidance included
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Safe and supportive environment
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-auto lg:min-w-[400px] xl:min-w-[450px]">
              <form
                onSubmit={form.handleSubmit((values) => bookingMutation.mutate(values))}
                className="bg-primary border border-border rounded-xl p-4 sm:p-6 lg:p-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  
                  <div className="col-span-full">
                    <label className="block text-primary-foreground text-xs font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      {...form.register('fullName')}
                      type="text"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="Enter your full name"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-primary-foreground text-xs font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      {...form.register('email')}
                      type="email"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="your@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-primary-foreground text-xs font-semibold mb-2">
                      Phone *
                    </label>
                    <input
                      {...form.register('phone')}
                      type="tel"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="+91 98765 43210"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="col-span-full">
                    <label className="block text-primary-foreground text-xs font-semibold mb-2">
                      Number of People *
                    </label>
                    <input
                      {...form.register('numberOfPeople')}
                      type="number"
                      min="1"
                      max="50"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="1"
                    />
                    {form.formState.errors.numberOfPeople && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.numberOfPeople.message}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-primary-foreground text-xs font-semibold mb-2">
                      Sharing Type *
                    </label>
                    <select
                      {...form.register('sharingType')}
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    >
                      <option value="double">Double Sharing</option>
                      <option value="single">Single Sharing</option>
                    </select>
                    {form.formState.errors.sharingType && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.sharingType.message}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-primary-foreground text-xs font-semibold mb-2">
                      Booking Date *
                    </label>
                    <select
                      {...form.register('bookingDate')}
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    >
                      <option value="">Select Date</option>
                      <option value="22/05/2026 to 24/05/2026">22 May to 24 May 2026</option>
                      <option value="29/05/2026 to 31/05/2026">29 May to 31 May 2026</option>
                    </select>
                    {form.formState.errors.bookingDate && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.bookingDate.message}</p>
                    )}
                  </div>

                  <div className="col-span-full">
                    <label className="block text-primary-foreground text-xs font-semibold mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      {...form.register('message')}
                      rows={4}
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all resize-none"
                      placeholder="Any special requirements or questions..."
                    />
                  </div>

                  <div className="col-span-full pt-2">
                    <Button
                      type="submit"
                      disabled={bookingMutation.isPending}
                      variant="secondary"
                      className="w-full py-3 text-sm font-semibold transition-colors"
                    >
                      {bookingMutation.isPending ? 'Submitting...' : 'Submit Booking Request'}
                    </Button>
                    {Object.keys(form.formState.errors).length > 0 && (
                      <p className="text-red-300 text-xs mt-2">
                        Please fill in all required fields correctly
                      </p>
                    )}
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
