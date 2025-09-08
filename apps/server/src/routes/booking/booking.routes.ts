import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { type HonoContext } from '../../lib/context'
import { createBooking, initiatePatientAuth, verifyPatientAuth } from './booking.service'
import { createBookingInput, initiatePatientAuthInput, verifyPatientInput } from './booking.input'

export const bookingApp = new Hono<{ Variables: HonoContext }>()
  .post('/initiate', zValidator('json', initiatePatientAuthInput), async (c) =>
    initiatePatientAuth(c, c.req.valid('json')),
  )
  .post('/verify', zValidator('json', verifyPatientInput), async (c) => verifyPatientAuth(c, c.req.valid('json')))
  .post('/create', zValidator('json', createBookingInput), async (c) => createBooking(c, c.req.valid('json')))
