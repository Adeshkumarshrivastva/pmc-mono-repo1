import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { createBookingInput } from './booking.input'
import { createBooking, getBookingWithPayments } from './booking.service'
import { authMiddleware } from '../../middleware/auth.middleware'

export const bookingApp = new Hono<{ Variables: HonoContext }>()
  .use(authMiddleware)
  .get('/:bookingId', async (c) => getBookingWithPayments(c, c.req.param('bookingId')))
  .post('/create', zValidator('json', createBookingInput), async (c) => createBooking(c, c.req.valid('json')))
