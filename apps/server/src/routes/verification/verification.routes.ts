import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { type HonoContext } from '../../lib/context'
import { initiatePatientAuth, verifyPatientAuth } from './verification.service'
import { initiatePatientAuthInput, verifyPatientInput } from './verification.input'

export const verificationApp = new Hono<{ Variables: HonoContext }>()
  .post('/initiate', zValidator('json', initiatePatientAuthInput), async (c) =>
    initiatePatientAuth(c, c.req.valid('json')),
  )
  .post('/verify', zValidator('json', verifyPatientInput), async (c) => verifyPatientAuth(c, c.req.valid('json')))
