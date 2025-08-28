import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client'
import { honoClient } from './lib/hono-client'
import { authClient } from './lib/auth-client'
import { env } from './lib/env'
import './index.css'

const router = createRouter({ routeTree, context: { queryClient } })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          basepath={env.VITE_PUBLIC_BASE_PATH}
          context={{ honoClient, authClient, queryClient }}
        />
      </QueryClientProvider>
    </StrictMode>,
  )
}
