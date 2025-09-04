import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { type HonoContext } from '../../lib/context'
import { getPatientByMobileNumber, verifyPatient } from './booking.service'
import { getPatientByMobileNumberInput, verifyPatientInput } from './booking.input'

const app = new Hono<{ Variables: HonoContext }>()
  .post('/booking/intiate', zValidator('form', getPatientByMobileNumberInput), async (c) =>
    getPatientByMobileNumber(c, c.req.valid('form')),
  )
  .post('/booking/verify', zValidator('form', verifyPatientInput), async (c) => verifyPatient(c, c.req.valid('form')))

export default app
