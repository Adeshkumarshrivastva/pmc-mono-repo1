/*
 * CMS (Payload globals/collections) stores absolute links such as
 * `https://positivemindcare.com/quiz/anxiety-quiz`. Served from mindsai.tech,
 * following one of those leaves the site and the address bar shows the other
 * domain. Same-site links are rewritten to paths so navigation stays on the
 * current host. Other domains (subdomains, socials, mailto) are left untouched.
 */
const SITE_ORIGIN_RE = /^https?:\/\/(www\.)?positivemindcare\.com(?=[/?#]|$)/i

export function toSiteHref<T extends string | null | undefined>(href: T): T {
  if (!href) return href
  const path = href.replace(SITE_ORIGIN_RE, '')
  return (path === '' ? '/' : path) as T
}
