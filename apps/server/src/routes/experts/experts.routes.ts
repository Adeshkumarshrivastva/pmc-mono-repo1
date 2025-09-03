import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { expertMonthlyAvailableSlotsQuery, expertSearchQuery } from './experts.input'
import { type HonoContext } from '../../lib/context'
import { getExpertFromSlug, getExperts, getMonthlyAvailableSlots } from './experts.service'

export const expertApp = new Hono<{ Variables: HonoContext }>()
  .get('/experts', zValidator('query', expertSearchQuery), async (c) => getExperts(c, c.req.valid('query')))
  .get('/:expertSlug', async (c) => getExpertFromSlug(c, c.req.param('expertSlug')))
  .get('/monthly-avaialble-slots', zValidator('query', expertMonthlyAvailableSlotsQuery), async (c) =>
    getMonthlyAvailableSlots(c, c.req.valid('query')),
  )
