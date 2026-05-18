'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { createFranchiseRequest } from '@/payload/actions'

const franchiseBookingSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  city: z.string().min(2, 'City is required'),
  message: z.string().optional(),
})

type FranchiseBookingData = z.infer<typeof franchiseBookingSchema>

export default function FranchiseBookingForm() {
  const form = useForm<FranchiseBookingData>({
    resolver: zodResolver(franchiseBookingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      city: '',
      message: '',
    },
  })

  const franchiseMutation = useMutation({
    mutationFn: async (data: FranchiseBookingData) => {
      // Format franchise details as message
      const franchiseDetails = `
Franchise Inquiry:
- City: ${data.city}
${data.message ? `- Additional Message: ${data.message}` : ''}
      `.trim()

      return createFranchiseRequest({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        message: franchiseDetails,
      })
    },
    onSuccess: () => {
      toast.success('Franchise inquiry submitted!', {
        description: 'Our team will contact you shortly to discuss the opportunity.',
      })
      form.reset()
    },
    onError: (error) => {
      console.error('Franchise submission error:', error)
      toast.error('Failed to submit franchise inquiry', {
        description: 'Please try again later or contact us directly.',
      })
    },
  })

  return (
    <section className="w-full flex-1 bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Left: Franchise Info */}
            <div className="space-y-6">
              <Link href="/" className="inline-block text-primary hover:underline mb-4">
                ← Back to Home
              </Link>
              
              <h2 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">
                Franchise Inquiry
              </h2>
              
              <div className="text-lg text-foreground space-y-4">
                <p>
                  Join the Positive Mind Care family and bring mental health wellness to your community. 
                  Our franchise model offers comprehensive support and proven systems.
                </p>
                <p>
                  Partner with us to make a meaningful impact while building a successful business 
                  in the growing mental health sector.
                </p>
              </div>

              <div className="mt-8 space-y-4 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Comprehensive training program
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ongoing operational support
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Proven business model
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Marketing and branding support
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-auto lg:min-w-[400px] xl:min-w-[450px]">
              <form
                onSubmit={form.handleSubmit((values) => franchiseMutation.mutate(values))}
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
                      City *
                    </label>
                    <input
                      {...form.register('city')}
                      type="text"
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="Enter city"
                    />
                    {form.formState.errors.city && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.city.message}</p>
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
                      placeholder="Tell us about your background and why you're interested..."
                    />
                  </div>

                  <div className="col-span-full pt-2">
                    <Button
                      type="submit"
                      disabled={franchiseMutation.isPending}
                      variant="secondary"
                      className="w-full py-3 text-sm font-semibold transition-colors"
                    >
                      {franchiseMutation.isPending ? 'Submitting...' : 'Submit Franchise Inquiry'}
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
