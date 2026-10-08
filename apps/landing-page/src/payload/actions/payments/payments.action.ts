'use server'

import { createHmac, timingSafeEqual } from 'node:crypto'
import Razorpay from 'razorpay'
import { env } from '@/env'
import { TRIAL_SESSION_AMOUNT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import type { Souvenir } from '@/payload/types'

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

const PAYMENT_FAILED_MESSAGE = 'Payment verification failed. Please contact support before trying again.'

export type CatalogKind = 'package' | 'card' | 'souvenir'

type CatalogOrderInput = {
  kind: CatalogKind
  // package/card: slug, souvenir: product id
  key: string
}

// Amount is always looked up on the server from the CMS. The client only says which item it wants.
async function resolveCatalogPrice({ kind, key }: CatalogOrderInput): Promise<number> {
  const payload = await getPayloadClient()
  let price: unknown

  if (kind === 'souvenir') {
    const result = await payload.find({ collection: 'souvenirs', depth: 0, limit: 1 })
    const souvenir = result.docs[0] as Souvenir | undefined
    price = souvenir?.products?.find((product) => product.id === key)?.price
  } else {
    const home = await payload.findGlobal({ slug: 'home' })

    if (kind === 'package') {
      price = home.packagesSection?.availablePackages?.find((pkg) => pkg.slug === key)?.price
    } else {
      const cards = home.cardSection?.cards?.[0]
      const slots = [
        { slug: cards?.card1Slug, price: cards?.card1Price },
        { slug: cards?.card2Slug, price: cards?.card2Price },
        { slug: cards?.card3Slug, price: cards?.card3Price },
      ]
      price = slots.find((slot) => slot.slug === key)?.price
    }
  }

  const amount = Number(price)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('This item is not available for online payment right now.')
  }
  return amount
}

// Local development only: test-mode checkout without a server order, so the flow can be tried without Razorpay.
const DEV_TEST_KEY_ID = 'rzp_test_JNSOKgtrfEng3Y'
const isProduction = process.env.NODE_ENV === 'production'

// Creates a Razorpay order for a CMS item. In production it throws on failure; in development it falls back to test mode.
export async function createCatalogOrder(input: CatalogOrderInput) {
  const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID || (isProduction ? '' : DEV_TEST_KEY_ID)
  if (!keyId) {
    throw new Error('Online payment is currently unavailable. Please contact us for assistance.')
  }

  const amount = await resolveCatalogPrice(input)
  const amountPaise = Math.round(amount * 100)

  try {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `${input.kind}_${Date.now()}`,
      notes: { kind: input.kind, key: input.key },
    })

    if (!order) throw new Error('Razorpay did not return an order.')

    return { orderId: order.id as string | null, amount: amountPaise, currency: 'INR', keyId, testMode: false }
  } catch (error) {
    console.error('Error creating catalog order:', error)
    if (!isProduction) {
      return { orderId: null, amount: amountPaise, currency: 'INR', keyId, testMode: true }
    }
    throw new Error('Could not start payment. Please try again.')
  }
}

export async function createTrialSessionOrder() {
  try {
    const order = await razorpay.orders.create({
      amount: TRIAL_SESSION_AMOUNT * 100,
      currency: 'INR',
      receipt: `trial_${Date.now()}`,
    })

    if (!order) {
      throw new Error('Razorpay did not return an order.')
    }

    return { orderId: order.id }
  } catch (error) {
    console.error('Error creating trial session order:', error)
    throw new Error('Could not start payment. Please try again.')
  }
}

type VerifyPaymentInput = {
  orderId: string
  paymentId: string
  signature: string
}

// Checks the Razorpay HMAC signature, then asks Razorpay that the payment is captured for this order and amount.
async function assertCapturedPayment({ orderId, paymentId, signature }: VerifyPaymentInput, expectedAmount?: number) {
  if (!orderId || !paymentId || !/^[a-f\d]{64}$/i.test(signature)) {
    throw new Error(PAYMENT_FAILED_MESSAGE)
  }

  const expectedSignature = createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest()
  const receivedSignature = Buffer.from(signature, 'hex')

  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(receivedSignature, expectedSignature)) {
    throw new Error(PAYMENT_FAILED_MESSAGE)
  }

  try {
    const [order, payment] = await Promise.all([razorpay.orders.fetch(orderId), razorpay.payments.fetch(paymentId)])
    const amount = expectedAmount ?? order.amount

    if (
      payment.order_id !== orderId ||
      payment.status !== 'captured' ||
      payment.amount !== amount ||
      payment.amount !== order.amount ||
      payment.currency !== 'INR'
    ) {
      throw new Error('Payment is not captured for the expected amount.')
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw new Error(PAYMENT_FAILED_MESSAGE)
  }
}

// Used by the package, card and souvenir checkout after the Razorpay modal succeeds.
export async function verifyCatalogPayment(input: VerifyPaymentInput) {
  await assertCapturedPayment(input)
  return { ok: true as const }
}

export async function verifyTrialSessionPayment(input: VerifyPaymentInput) {
  await assertCapturedPayment(input, TRIAL_SESSION_AMOUNT * 100)
}
