import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

type Context = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<Context>()({
  component: () => <Outlet />,
})
