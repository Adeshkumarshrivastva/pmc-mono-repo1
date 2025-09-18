import { authClient } from '@/lib/auth-client'

export const CURRENT_SESSION_QUERY_KEY = ['current-session']

export async function getUserSession() {
  return authClient.getSession()
}
