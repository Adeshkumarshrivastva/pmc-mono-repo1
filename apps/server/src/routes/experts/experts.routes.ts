import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import {
  expertMonthlyAvailableSlotsQuery,
  expertProfileSerarchQuery,
  expertSearchQuery,
  expertServiceSearchQuery,
} from './experts.input'
import {
  getExpertFromSlug,
  getExperts,
  getExpertMonthlyAvailableSlots,
  getExpertServiceFromSlug,
} from './experts.service'

export const expertApp = new Hono<{ Variables: HonoContext }>()
  .get('/experts', zValidator('query', expertSearchQuery), async (c) => getExperts(c, c.req.valid('query')))
  .get('/profile', zValidator('query', expertProfileSerarchQuery), async (c) =>
    getExpertFromSlug(c, c.req.valid('query')),
  )
  .get('/service', zValidator('query', expertServiceSearchQuery), async (c) =>
    getExpertServiceFromSlug(c, c.req.valid('query')),
  )
  .get('/monthly-avaialble-slots', zValidator('query', expertMonthlyAvailableSlotsQuery), async (c) =>
    getExpertMonthlyAvailableSlots(c, c.req.valid('query')),
  )
