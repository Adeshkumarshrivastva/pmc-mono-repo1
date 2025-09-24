import type { Context, Next } from 'hono'
import { auth } from '../lib/auth'

export const authMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 403)
  }
  c.set('session', session.session)
  c.set('user', session.user)
  return next()
}
