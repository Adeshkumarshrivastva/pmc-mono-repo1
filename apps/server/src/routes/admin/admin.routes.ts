import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import {
  getAdminDashboard,
  createExpert,
  getExpertDetails,
  updateExpertInfo,
  deleteExpert,
  getExpertAvailability,
  updateExpertAvailability,
  getExpertServices,
  createServiceForExpert,
  getServiceDetails,
  updateServiceForExpert,
  deleteServiceForExpert,
} from './admin.service'
import {
  createExpertInput,
  updateExpertInfoInput,
  updateAvailabilityInput,
  createServiceForExpertInput,
  updateServiceForExpertInput,
} from './admin.input'

export const adminApp = new Hono<{ Variables: HonoContext }>()
  .get('/dashboard', authMiddleware, requirePermission(['ADMIN']), (c) => getAdminDashboard(c))
  .post('/experts', authMiddleware, requirePermission(['ADMIN']), zValidator('json', createExpertInput), (c) =>
    createExpert(c, c.req.valid('json')),
  )
  .get('/experts/:expertId', authMiddleware, requirePermission(['ADMIN']), (c) =>
    getExpertDetails(c, c.req.param('expertId')),
  )
  .patch(
    '/experts/:expertId',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('json', updateExpertInfoInput),
    (c) => updateExpertInfo(c, c.req.param('expertId'), c.req.valid('json')),
  )
  .delete('/experts/:expertId', authMiddleware, requirePermission(['ADMIN']), (c) =>
    deleteExpert(c, c.req.param('expertId')),
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
  .get('/experts/:expertId/services', authMiddleware, requirePermission(['ADMIN']), (c) =>
    getExpertServices(c, c.req.param('expertId')),
  )
  .post(
    '/experts/:expertId/services',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('json', createServiceForExpertInput),
    (c) => createServiceForExpert(c, c.req.param('expertId'), c.req.valid('json')),
  )
  .get('/services/:serviceId', authMiddleware, requirePermission(['ADMIN']), (c) =>
    getServiceDetails(c, c.req.param('serviceId')),
  )
  .patch(
    '/services/:serviceId',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('json', updateServiceForExpertInput),
    (c) => updateServiceForExpert(c, c.req.param('serviceId'), c.req.valid('json')),
  )
  .delete('/services/:serviceId', authMiddleware, requirePermission(['ADMIN']), (c) =>
    deleteServiceForExpert(c, c.req.param('serviceId')),
  )
