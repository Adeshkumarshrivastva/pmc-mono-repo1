import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields, phoneNumberClient } from 'better-auth/client/plugins'
import type { auth } from '@pmc/server/src/lib/auth'
import { env } from './env'

export const authClient = createAuthClient({
  baseURL: env.VITE_PUBLIC_API_BASE_URL,
  plugins: [phoneNumberClient(), inferAdditionalFields<typeof auth>()],
  basePath: '/server/auth',
})

export type AuthClient = typeof authClient
