import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { expertMonthlyAvailableSlotsQuery, expertSearchQuery, serviceSearchQuery } from './experts.input'
import {
  getExpertFromSlug,
  getExperts,
  getExpertMonthlyAvailableSlots,
  getExpertServiceFromSlug,
  getServices,
} from './experts.service'

export const expertApp = new Hono<{ Variables: HonoContext }>()
  .get('', zValidator('query', expertSearchQuery), async (c) => getExperts(c, c.req.valid('query')))
  .get(':expertSlug', async (c) => getExpertFromSlug(c, c.req.param('expertSlug')))
  .get(':expertSlug/service/:serviceSlug', async (c) =>
    getExpertServiceFromSlug(c, c.req.param('expertSlug'), c.req.param('serviceSlug')),
  )
  .get(
    ':expertId/monthly-available-slots/:serviceId',
    zValidator('query', expertMonthlyAvailableSlotsQuery),
    async (c) =>
      getExpertMonthlyAvailableSlots(c, c.req.param('expertId'), c.req.param('serviceId'), c.req.valid('query')),
  )
  .get('/services', zValidator('query', serviceSearchQuery), async (c) => getServices(c, c.req.valid('query')))
