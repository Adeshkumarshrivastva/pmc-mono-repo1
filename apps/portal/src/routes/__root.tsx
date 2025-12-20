import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import type { HonoClient } from '@/lib/hono-client'
import { authClient, type AuthClient } from '@/lib/auth-client'

type Context = {
  queryClient: QueryClient
  honoClient?: HonoClient
  authClient?: AuthClient
}

export const Route = createRootRouteWithContext<Context>()({
  beforeLoad: async () => {
    const sessionData = await authClient.getSession()
    return { sessionData }
  },
  component: () => (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  ),
})
