import { Hono } from 'hono'
import { HonoContext } from '../lib/context'
import { invariant } from '../lib/utils'

export const userApp = new Hono<{ Variables: HonoContext }>()
  .get('/', (c) => c.json({}))
  .get('/me', (c) => {
    const user = c.get('user')
    invariant(user, 'user should be present')
    return c.json({ currentUser: user })
  })
