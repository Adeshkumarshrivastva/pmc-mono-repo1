import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { createBookingInput } from './booking.input'
import { createBooking, getAllBookings, getBookingStats, getBookingWithPayments } from './booking.service'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'

export const bookingApp = new Hono<{ Variables: HonoContext }>()
  .use(authMiddleware)
  .get('/:bookingId', async (c) => getBookingWithPayments(c, c.req.param('bookingId')))
  .post('/create', zValidator('json', createBookingInput), async (c) => createBooking(c, c.req.valid('json')))

  .post('/create', authMiddleware, requirePermission(['PATIENT']), zValidator('json', createBookingInput), async (c) =>
    createBooking(c, c.req.valid('json')),
  )
  .get('/all-bookings', authMiddleware, requirePermission(['ADMIN']), async (c) => getAllBookings(c))
  .get('/all-booking-stats', authMiddleware, requirePermission(['ADMIN']), async (c) => getBookingStats(c))
