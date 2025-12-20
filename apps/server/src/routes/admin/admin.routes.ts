import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import { getAdminDashboard, getExpertDetails, updateExpertInfo, getExpertAvailability, updateExpertAvailability } from './admin.service'
import { updateExpertInfoInput, updateAvailabilityInput } from './admin.input'

export const adminApp = new Hono<{ Variables: HonoContext }>()
  .get('/dashboard', authMiddleware, requirePermission(['ADMIN']), (c) => getAdminDashboard(c))
  .get('/experts/:expertId', authMiddleware, requirePermission(['ADMIN']), (c) => getExpertDetails(c, c.req.param('expertId')))
  .patch(
    '/experts/:expertId',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('json', updateExpertInfoInput),
    (c) => updateExpertInfo(c, c.req.param('expertId'), c.req.valid('json')),
  )
  .get('/experts/:expertId/availability', authMiddleware, requirePermission(['ADMIN']), (c) =>
    getExpertAvailability(c, c.req.param('expertId')),
  )
  .post(
    '/experts/:expertId/availability',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('json', updateAvailabilityInput),
    (c) => updateExpertAvailability(c, c.req.param('expertId'), c.req.valid('json')),
  )
