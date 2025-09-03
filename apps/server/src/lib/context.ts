import { type User, type Session } from 'better-auth'
import { type Context } from 'hono'

export type HonoContext = {
  session?: Session
  user?: User
}

export type C = Context<{ Variables: HonoContext }>
