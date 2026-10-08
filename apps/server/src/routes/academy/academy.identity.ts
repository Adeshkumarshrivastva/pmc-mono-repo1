import type { Next } from 'hono'
import type { C } from '../../lib/context'
import { auth } from '../../lib/auth'

/**
 * Resolves "who is asking" for the academy's pay-per-material flow, where
 * browsing, buying a material and taking its quiz all work with or without
 * an account — same scheme as the academy-demo's `middleware/identity.js`:
 * `user:<id>` for a signed-in visitor, `guest:<uuid>` for everyone else.
 *
 * The demo read the guest id from an `X-Guest-Id` header (JSON requests) or
 * a `?guest=` query param (plain links, which can't set headers) — kept as a
 * header-or-query check here so one middleware covers both. A signed-in
 * visitor needs neither: better-auth's session cookie rides along
 * automatically on fetches and on direct link navigation alike.
 *
 * A third form, `legacy:<old mongo id>`, is produced only from the trusted
 * `X-Legacy-Academy-Id` header — never from a guest id, so it can't collide
 * with one. This is how `apps/academy/server` (the old Express app, still
 * running its own JWT login) proxies requests here on behalf of its
 * logged-in users: the migration script (`migrate-to-main-db.js`) stored
 * their existing purchases/quiz attempts/enrollments under exactly this
 * `legacy:<id>` string, so the proxy must send the same id back unchanged
 * for that data to resolve. This header is only ever set by that
 * server-to-server proxy, not by a public browser — treat it as a trusted
 * caller, not user input.
 */
export async function resolveAcademyIdentity(c: C, next: Next) {
  const legacyId = c.req.header('x-legacy-academy-id')
  if (legacyId) {
    c.set('academyIdentity', `legacy:${legacyId}`)
    return next()
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)

  if (session) {
    c.set('session', session.session)
    c.set('user', session.user)
  }

  const guestId = c.req.header('x-guest-id') ?? c.req.query('guest')
  const identity = session ? `user:${session.user.id}` : guestId ? `guest:${guestId}` : null

  if (!identity) {
    return c.json({ error: 'Missing identity — please refresh the page and try again.' }, 400)
  }

  c.set('academyIdentity', identity)
  return next()
}
