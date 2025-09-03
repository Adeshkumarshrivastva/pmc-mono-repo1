import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { expertSearchQuery } from './experts.input'
import { type HonoContext } from '../../lib/context'
import { getExpertFromSlug, getExperts } from './experts.service'

const app = new Hono<{ Variables: HonoContext }>()
  .get('/experts', zValidator('query', expertSearchQuery), async (c) => getExperts(c, c.req.valid('query')))
  .get('/experts/:expertSlug', async (c) => getExpertFromSlug(c, c.req.param('expertSlug')))

export default app
