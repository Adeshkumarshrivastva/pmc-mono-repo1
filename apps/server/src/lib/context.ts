import { type User, type Session } from 'better-auth'
import { type Context } from 'hono'

export type HonoContext = {
  session?: Session
  user?: User
  // Set by academy.identity.ts — `user:<id>` or `guest:<uuid>`, for the
  // academy's buy/quiz/certificate flow, which works without an account.
  academyIdentity?: string
}

export type C = Context<{ Variables: HonoContext }>
