import { env } from '@/env'

/*
 * The API is a separate Bun/Hono app, but in production nginx proxies it at
 * `/server` on this very origin, so browser-side calls must stay relative.
 * Production browser requests stay relative so they use the current site's proxy.
 * In development the landing page and API run on different ports, so the configured
 * NEXT_PUBLIC_API_BASE_URL is used directly by the browser.
 *
 * On the server (SSR / route handlers) there is no origin to resolve a relative
 * path against, so the server-only API_BASE_URL is used there instead.
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      return `${env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, '')}${normalizedPath}`
    }

    return normalizedPath
  }

  return `${env.API_BASE_URL.replace(/\/+$/, '')}${normalizedPath}`
}
