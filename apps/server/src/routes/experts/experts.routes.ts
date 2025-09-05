import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { expertMonthlyAvailableSlotsQuery, expertSearchQuery } from './experts.input'
import {
  getExpertFromSlug,
  getExperts,
  getExpertMonthlyAvailableSlots,
  getExpertServiceFromSlug,
} from './experts.service'

export const expertsApp = new Hono<{ Variables: HonoContext }>()
  .get('', zValidator('query', expertSearchQuery), async (c) => getExperts(c, c.req.valid('query')))
  .get(':expertSlug', async (c) => getExpertFromSlug(c, c.req.param('expertSlug')))
  .get(':expertSlug/service/:serviceSlug', async (c) =>
    getExpertServiceFromSlug(c, c.req.param('expertSlug'), c.req.param('serviceSlug')),
  )
  .get(
    ':expertSlug/monthly-available-slots/:serviceSlug',
    zValidator('query', expertMonthlyAvailableSlotsQuery),
    async (c) =>
      getExpertMonthlyAvailableSlots(c, c.req.param('expertSlug'), c.req.param('serviceSlug'), c.req.valid('query')),
  )
