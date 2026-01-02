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
  updateAvailabilityInput,
  bulkCreateBlockedDatesInput,
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
  updateAvailability,
  getAvailability,
  getExpertDashboard,
  getPublicExpertsList,
  deleteBlockedDate,
  bulkCreateBlockedDates,
} from './experts.service'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'

export const expertsApp = new Hono<{ Variables: HonoContext }>()
  .get('/public/list', async (c) => getPublicExpertsList(c))
  .get('/', zValidator('query', expertSearchQuery), async (c) => getExperts(c, c.req.valid('query')))
  .get('/all-experts', authMiddleware, requirePermission(['ADMIN']), async (c) => getAllExperts(c))
  .get('/bookings', authMiddleware, zValidator('query', expertBookingsSearchQuery), async (c) =>
    getExpertBookings(c, c.req.valid('query')),
  )
  .get('/bookings/:bookingId', async (c) => getExpertBooking(c, c.req.param('bookingId')))
  .post('/bookings/prescription', authMiddleware, zValidator('json', createPrescriptionInput), async (c) =>
    createPrescription(c, c.req.valid('json')),
  )
  .get('/dashboard', authMiddleware, async (c) => getExpertDashboard(c))
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
  .get('/availability', authMiddleware, async (c) => getAvailability(c))
  .post('/availability', authMiddleware, zValidator('json', updateAvailabilityInput), async (c) =>
    updateAvailability(c, c.req.valid('json')),
  )
  .post(
    '/availability/block-dates/bulk-create',
    authMiddleware,
    zValidator('json', bulkCreateBlockedDatesInput),
    async (c) => bulkCreateBlockedDates(c, c.req.valid('json')),
  )
  .delete('/availability/block-dates/:blockedDateId', authMiddleware, async (c) =>
    deleteBlockedDate(c, c.req.param('blockedDateId')),
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
