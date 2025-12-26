import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import {
  getPatientBookings,
  getPatientByUserId,
  getPatientDashboard,
  getPatients,
  sendTrialSessionEmail,
  updatePatientByUserId,
} from './patient.service'
import { patientBookingsSearchQuery, sendTrialSessionEmailInput, updatePatientInput } from './patient.input'

export const patientApp = new Hono<{ Variables: HonoContext }>()
  .get('/patients', authMiddleware, requirePermission(['ADMIN']), (c) => getPatients(c))
  .get('/patient-details', authMiddleware, requirePermission(['PATIENT']), (c) => getPatientByUserId(c))
  .patch(
    '/patient-details',
    authMiddleware,
    requirePermission(['PATIENT']),
    zValidator('json', updatePatientInput),
    async (c) => updatePatientByUserId(c, c.req.valid('json')),
  )
  .get(
    '/bookings',
    authMiddleware,
    requirePermission(['PATIENT']),
    zValidator('query', patientBookingsSearchQuery),
    async (c) => getPatientBookings(c, c.req.valid('query')),
  )
  .get('/dashboard', authMiddleware, requirePermission(['PATIENT']), (c) => getPatientDashboard(c))
  .post('/send-trial-sesssion', zValidator('json', sendTrialSessionEmailInput), (c) =>
    sendTrialSessionEmail(c, c.req.valid('json')),
  )
