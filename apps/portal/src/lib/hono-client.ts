import { hc } from 'hono/client'
import { type App } from '@pmc/server'
import { env } from './env'

export const honoClient = hc<App>(env.VITE_PUBLIC_API_BASE_URL)
