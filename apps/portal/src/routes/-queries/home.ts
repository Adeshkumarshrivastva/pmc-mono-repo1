import { honoClient } from '../../lib/hono-client'

export async function fetchHomeData() {
  const res = await honoClient.api.$get()
  const json = await res.json()
  return json
}

export const HOME_QUERY = ['home']
