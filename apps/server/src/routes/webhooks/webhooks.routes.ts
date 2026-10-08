import { Hono } from 'hono'
import type { HonoContext } from '../../lib/context'
import { academyPurchaseConfirmation, paymentConfirmation } from './webhooks.service'
import { academyPurchaseConfirmationInput, paymentConfirmationInput } from './webhooks.input'
import { verifyWebhookSignature } from '../../lib/razorpay'

export const webhooksApp = new Hono<{ Variables: HonoContext }>()
  .post('/razorpay/payment-confirmation', async (c) => {
    // Read the raw body first: the signature is computed over the exact bytes Razorpay sent.
    const rawBody = await c.req.text()

    if (!verifyWebhookSignature(rawBody, c.req.header('x-razorpay-signature'))) {
      return c.json({ error: 'Invalid webhook signature' }, 401)
    }

    let json: unknown
    try {
      json = JSON.parse(rawBody)
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400)
    }

    const parsed = paymentConfirmationInput.safeParse(json)
    if (!parsed.success) {
      return c.json({ error: 'Invalid payload' }, 400)
    }

    return paymentConfirmation(c, parsed.data)
  })
  .post('/razorpay/academy-purchase-confirmation', async (c) => {
    const rawBody = await c.req.text()

    if (!verifyWebhookSignature(rawBody, c.req.header('x-razorpay-signature'))) {
      return c.json({ error: 'Invalid webhook signature' }, 401)
    }

    let json: unknown
    try {
      json = JSON.parse(rawBody)
    } catch {
      return c.json({ error: 'Invalid JSON' }, 400)
    }

    const parsed = academyPurchaseConfirmationInput.safeParse(json)
    if (!parsed.success) {
      return c.json({ error: 'Invalid payload' }, 400)
    }

    return academyPurchaseConfirmation(c, parsed.data)
  })
