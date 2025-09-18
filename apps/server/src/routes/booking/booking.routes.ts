import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { createBookingInput } from './booking.input'
import { createBooking } from './booking.service'

export const bookingApp = new Hono<{ Variables: HonoContext }>().post(
  '/create',
  zValidator('json', createBookingInput),
  async (c) => createBooking(c, c.req.valid('json')),
)
