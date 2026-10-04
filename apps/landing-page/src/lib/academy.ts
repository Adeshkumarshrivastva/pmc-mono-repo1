/**
 * The academy course app (apps/academy) — the paid-course flow: browse courses,
 * pay to unlock the material, then quiz and certificate.
 *
 * It is a separate Vite SPA served at this path prefix, not a Next.js route, so
 * links to it must be plain `<a>` elements. A next/link would try to resolve it
 * client-side against the App Router and land on a 404 — which is exactly what
 * the Academy button in the header used to do.
 *
 * In dev, next.config.mjs proxies this prefix to the Vite dev server on :5174;
 * in prod, nginx serves the build from /var/www/pmc/academy-app.
 */
export const ACADEMY_APP_URL = '/academy-app'

/** The CMS marketing page for the academy programme — a real Next.js route. */
export const ACADEMY_MARKETING_URL = '/academy'
