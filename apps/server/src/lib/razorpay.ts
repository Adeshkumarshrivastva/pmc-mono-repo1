import { createHmac, timingSafeEqual } from 'node:crypto'
import Razorpay from 'razorpay'
import { config } from '../config'
import { env } from './env'

export const razorpayInstance = new Razorpay({
  key_id: config.payment.razorpay.keyId,
  key_secret: config.payment.razorpay.keySecret,
})

// Razorpay signs the raw webhook body with the webhook secret (set in the Razorpay dashboard), sent in X-Razorpay-Signature.
// Fails closed: if no webhook secret is configured, every webhook is rejected.
export function verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  const secret = env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false

  const expected = createHmac('sha256', secret).update(rawBody).digest()
  const received = Buffer.from(signature, 'hex')

  return received.length === expected.length && timingSafeEqual(received, expected)
}
