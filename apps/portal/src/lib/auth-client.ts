import { createAuthClient } from 'better-auth/react'
import { phoneNumberClient } from 'better-auth/client/plugins'
import { env } from './env'

export const authClient = createAuthClient({
  baseURL: env.VITE_PUBLIC_API_BASE_URL,
  plugins: [phoneNumberClient()],
  basePath: '/server/auth',
})
