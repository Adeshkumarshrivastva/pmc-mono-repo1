import { type User, type Session } from 'better-auth'

export type HonoContext = {
  session?: Session
  user?: User
}
