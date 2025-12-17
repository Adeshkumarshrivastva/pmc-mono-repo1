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

export const requirePermission = (role: ('EXPERT' | 'ADMIN' | 'PATIENT')[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user')

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    if (!role.includes(user.role)) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403)
    }

    return next()
  }
}
