import { env } from '@/env'

/*
 * The API is a separate Bun/Hono app, but in production nginx proxies it at
 * `/server` on this very origin, so browser-side calls must stay relative.
 * NEXT_PUBLIC_API_BASE_URL is inlined into the client bundle at build time, so an
 * absolute origin there breaks the moment the site is served from another domain:
 * requests go to the wrong host, or CORS blocks them.
 *
 * On the server (SSR / route handlers) there is no origin to resolve a relative
 * path against, so the server-only API_BASE_URL is used there instead.
 */
export function apiUrl(path: string): string {
  if (typeof window !== 'undefined') return path
  return `${env.API_BASE_URL}${path}`
}
