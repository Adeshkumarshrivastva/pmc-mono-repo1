import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { type HonoContext } from '../../lib/context'
import { initiatePatientAuth, verifyPatientAuth } from './booking.service'
import { getPatientByMobileNumberInput, verifyPatientInput } from './booking.input'

const app = new Hono<{ Variables: HonoContext }>()
  .post('/booking/intiate', zValidator('form', getPatientByMobileNumberInput), async (c) =>
    initiatePatientAuth(c, c.req.valid('form')),
  )
  .post('/booking/verify', zValidator('form', verifyPatientInput), async (c) =>
    verifyPatientAuth(c, c.req.valid('form')),
  )

export default app
