import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { type HonoContext } from '../lib/context'
import { invariant } from '../lib/utils'
import { authMiddleware } from '../middleware/auth.middleware'
import { prisma } from '../lib/db'

const existsQuery = z.object({
  phoneNumber: z.string().min(1),
})

export const userApp = new Hono<{ Variables: HonoContext }>()
  // Public (no authMiddleware): the mobile app and portal both need this
  // before a session exists, to decide whether to show the login or the
  // register flow for a phone number. See pmcapp src/lib/user.ts.
  .get('/exists', zValidator('query', existsQuery), async (c) => {
    const { phoneNumber } = c.req.valid('query')
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    })
    return c.json({ exists: !!user })
  })
  .use(authMiddleware)
  .get('/', (c) => c.json({}))
  .get('/me', (c) => {
    const user = c.get('user')
    invariant(user, 'user should be present')
    return c.json({ currentUser: user })
  })
