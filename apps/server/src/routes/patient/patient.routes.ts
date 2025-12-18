import { Hono } from 'hono'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import { getPatientByUserId, getPatients } from './patient.service'

export const patientApp = new Hono<{ Variables: HonoContext }>()
  .get('/patients', authMiddleware, requirePermission(['ADMIN']), (c) => getPatients(c))
  .get('/patient-details', authMiddleware, requirePermission(['PATIENT']), (c) => getPatientByUserId(c))
