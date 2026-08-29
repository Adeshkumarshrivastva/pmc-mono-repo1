'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { createOrder } from '@/payload/actions/payments/payments.action'
import { env } from '@/env'
import { toast } from 'sonner'

declare global {
  interface Window {
    Razorpay: any
  }
}

const buyFormSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  address: z.string().min(5, 'Shipping address is required'),
})

type BuyFormData = z.infer<typeof buyFormSchema>

type BuyFormSectionProps = {
  productId: string
  productName: string
  productPrice: number
  productImage?: string | null
}

export default function BuyFormSection({ productId, productName, productPrice, productImage }: BuyFormSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const form = useForm<BuyFormData>({
    resolver: zodResolver(buyFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  async function onSubmit(data: BuyFormData) {
    setIsSubmitting(true)
    try {
      console.log('Starting payment process for:', { productName, productPrice, data })

      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.')
      }

      let orderId: string | undefined

      // Try to create Razorpay order via API
      try {
        console.log('Creating order via API...')
        const orderResponse = await createOrder({
          amount: productPrice,
          currency: 'INR',
        })
        orderId = orderResponse.orderId
        console.log('Order created successfully:', orderId)
      } catch (apiError) {
        console.warn('API order creation failed, using test mode:', apiError)
        // Continue without order_id (test mode)
      }

      // Razorpay options
      const options = {
        key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_JNSOKgtrfEng3Y',
        amount: productPrice * 100,
        currency: 'INR',
        name: 'Positive Mind Care',
        description: `Purchase of ${productName}`,
        ...(orderId && { order_id: orderId }),
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          productId,
          product: productName,
          address: data.address,
        },
        theme: {
          color: '#3399cc',
        },
        handler: function (response: any) {
          toast.success('Payment successful!', {
            description: `Payment ID: ${response.razorpay_payment_id}`,
          })
          console.log('Payment successful:', response)
          setIsSubmitting(false)
          // TODO: Save order details to database
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false)
            toast.error('Payment cancelled')
          },
        },
      }

      console.log('Opening Razorpay modal...', orderId ? 'with order_id' : 'in test mode')
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Buy error:', error)
      toast.error('Failed to process order', {
        description: error instanceof Error ? error.message : 'Please try again later',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full flex-1 bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

            {/* Left: Product Info */}
            <div className="space-y-5">
              <Link
                href={`/souvenir/${productId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                Back
              </Link>

              <div className="flex items-center gap-4">
                {productImage && (
                  <div className="relative size-16 sm:size-20 shrink-0 rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                    <Image src={productImage} alt={productName} fill className="object-cover" />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Buying
                  </p>
                  <h2 className="text-xl font-semibold text-foreground leading-snug sm:text-2xl line-clamp-2">
                    {productName}
                  </h2>
                </div>
              </div>

              <p className="text-base text-muted-foreground">
                Complete your purchase by filling in the details
              </p>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">Product</p>
                    <p className="text-lg font-semibold text-foreground leading-snug line-clamp-2">{productName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">₹ {productPrice}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure payment processing
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant order confirmation
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  24/7 customer support
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-auto lg:min-w-[400px] xl:min-w-[450px]">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
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
                      Shipping Address *
                    </label>
                    <textarea
                      {...form.register('address')}
                      rows={4}
                      className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary transition-all resize-none"
                      placeholder="House no, street, city, state, pincode"
                    />
                    {form.formState.errors.address && (
                      <p className="text-red-300 text-xs mt-1">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="col-span-full pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      variant="secondary"
                      className="w-full py-3 text-sm font-semibold transition-colors"
                    >
                      {isSubmitting ? 'Processing...' : `Pay Now - ₹${productPrice}`}
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
