'use client'

import { verifyCatalogPayment } from '@/payload/actions/payments/payments.action'

type RazorpayPaymentResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void }

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

function getRazorpayCtor(): RazorpayCtor | undefined {
  return (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (getRazorpayCtor()) return resolve(true)

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT_URL}"]`)
    const script = existing ?? document.createElement('script')

    script.onload = () => resolve(Boolean(getRazorpayCtor()))
    script.onerror = () => resolve(false)

    if (!existing) {
      script.src = CHECKOUT_SCRIPT_URL
      script.async = true
      document.body.appendChild(script)
    }
  })
}

type OpenCheckoutInput = {
  keyId: string
  orderId: string | null
  amount: number
  description: string
  prefill: { name: string; email: string; contact: string }
  notes?: Record<string, string>
}

// Opens the Razorpay modal for a server-created order.
// Resolves true only after the server has verified the payment, false if the user dismissed the modal.
export async function openRazorpayCheckout(input: OpenCheckoutInput): Promise<boolean> {
  const loaded = await loadRazorpayScript()
  const Razorpay = getRazorpayCtor()
  if (!loaded || !Razorpay) {
    throw new Error('Could not load the payment gateway. Please refresh the page and try again.')
  }

  return new Promise<boolean>((resolve, reject) => {
    const checkout = new Razorpay({
      key: input.keyId,
      amount: input.amount,
      currency: 'INR',
      name: 'Positive Mind Care',
      description: input.description,
      ...(input.orderId ? { order_id: input.orderId } : {}),
      prefill: input.prefill,
      notes: input.notes,
      theme: { color: '#385246' },
      handler: async (response: RazorpayPaymentResponse) => {
        // Test mode (development only, no server order): nothing to verify.
        if (!input.orderId) {
          resolve(true)
          return
        }
        try {
          await verifyCatalogPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
          resolve(true)
        } catch (error) {
          reject(error)
        }
      },
      modal: {
        ondismiss: () => resolve(false),
      },
    })
    checkout.open()
  })
}
