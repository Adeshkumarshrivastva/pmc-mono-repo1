import { Hono } from 'hono'
import { type HonoContext } from '../lib/context'
import { invariant } from '../lib/utils'
import { authMiddleware } from '../middleware/auth.middleware'

export const userApp = new Hono<{ Variables: HonoContext }>()
  .use(authMiddleware)
  .get('/', (c) => c.json({}))
  .get('/me', (c) => {
    const user = c.get('user')
    invariant(user, 'user should be present')
    return c.json({ currentUser: user })
  })
