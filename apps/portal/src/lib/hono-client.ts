import { hc } from 'hono/client'
import { type App } from '@pmc/server'
import { z } from 'zod/v4'

export const honoClient = hc<App>(
  z.url().parse(import.meta.env.VITE_PUBLIC_API_BASE_URL),
)
