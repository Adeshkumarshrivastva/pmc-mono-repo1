import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { paymentConfirmation } from './webhooks.service'
import { paymentConfirmationInput } from './webhooks.input'

export const webhooksApp = new Hono<{ Variables: HonoContext }>().post(
  '/razorpay/payment-confirmation',
  zValidator('json', paymentConfirmationInput),
  async (c) => paymentConfirmation(c, c.req.valid('json')),
)
