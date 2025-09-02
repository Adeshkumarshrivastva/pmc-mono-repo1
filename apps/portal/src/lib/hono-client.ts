import { hc } from 'hono/client'
import { type App } from '@pmc/server'
import { env } from './env'
import { fetchWithCredentials } from './utils'

export const honoClient = hc<App>(env.VITE_PUBLIC_API_BASE_URL, {
  fetch: fetchWithCredentials,
})

export type HonoClient = ReturnType<typeof hc<App>>
