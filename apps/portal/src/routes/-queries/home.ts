import { honoClient } from '../../lib/hono-client'

export async function fetchHomeData() {
  const res = await honoClient.server.test[':messageId'].$get({ param: { messageId: '123' } })
  const json = await res.json()
  return json
}

export const HOME_QUERY = ['home']
