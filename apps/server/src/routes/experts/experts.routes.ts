import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import {
  createPrescriptionInput,
  expertBookingsSearchQuery,
  expertMonthlyAvailableSlotsQuery,
  expertProfileInput,
  expertSearchQuery,
  updatePaymentStatusInput,
  updatePrescriptionInput,
} from './experts.input'
import {
  getExpertFromSlug,
  getExperts,
  getExpertMonthlyAvailableSlots,
  getExpertServiceFromSlug,
  getExpertBooking,
  getExpertBookings,
  createPrescription,
  updatePrescription,
  downloadPrescription,
  getExpert,
  updateExpert,
  updatePaymentStatus,
  getAllExperts,
} from './experts.service'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'

export const expertsApp = new Hono<{ Variables: HonoContext }>()
  .get('/', zValidator('query', expertSearchQuery), async (c) => getExperts(c, c.req.valid('query')))
  .get('/all-experts', authMiddleware, requirePermission(['ADMIN']), async (c) => getAllExperts(c))
  .get('/bookings', authMiddleware, zValidator('query', expertBookingsSearchQuery), async (c) =>
    getExpertBookings(c, c.req.valid('query')),
  )
  .get('/bookings/:bookingId', async (c) => getExpertBooking(c, c.req.param('bookingId')))
  .post('/bookings/prescription', authMiddleware, zValidator('json', createPrescriptionInput), async (c) =>
    createPrescription(c, c.req.valid('json')),
  )
  .patch('/bookings/prescription', authMiddleware, zValidator('json', updatePrescriptionInput), async (c) =>
    updatePrescription(c, c.req.valid('json')),
  )
  .post('/bookings/download-prescription/:prescriptionId', authMiddleware, async (c) =>
    downloadPrescription(c, c.req.param('prescriptionId')),
  )
  .patch('/:bookingId/payment/status', authMiddleware, zValidator('json', updatePaymentStatusInput), async (c) =>
    updatePaymentStatus(c, c.req.valid('json')),
  )
  .get('/expert', authMiddleware, async (c) => getExpert(c))
  .patch('/expert', authMiddleware, zValidator('json', expertProfileInput), async (c) =>
    updateExpert(c, c.req.valid('json')),
  )
  .get('/:expertSlug', async (c) => getExpertFromSlug(c, c.req.param('expertSlug')))
  .get('/:expertSlug/service/:serviceSlug', async (c) =>
    getExpertServiceFromSlug(c, c.req.param('expertSlug'), c.req.param('serviceSlug')),
  )
  .get(
    '/:expertSlug/monthly-available-slots/:serviceSlug',
    zValidator('query', expertMonthlyAvailableSlotsQuery),
    async (c) =>
      getExpertMonthlyAvailableSlots(c, c.req.param('expertSlug'), c.req.param('serviceSlug'), c.req.valid('query')),
  )
