import type { MetadataRoute } from 'next'
import { env } from '@/env'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600

const STATIC_ROUTES = [
  { path: '', priority: 1 },
  { path: '/about-us', priority: 0.8 },
  { path: '/academy', priority: 0.8 },
  { path: '/blogs', priority: 0.8 },
  { path: '/contact-us', priority: 0.8 },
  { path: '/deep-tms', priority: 0.8 },
  { path: '/events', priority: 0.8 },
  { path: '/franchise', priority: 0.8 },
  { path: '/franchise/book', priority: 0.64 },
  { path: '/franchise/details', priority: 0.64 },
  { path: '/internship', priority: 0.8 },
  { path: '/outing', priority: 0.8 },
  { path: '/outing/book', priority: 0.64 },
  { path: '/portal/experts', priority: 0.8 },
  { path: '/privacy-policy', priority: 0.8 },
  { path: '/quiz', priority: 0.8 },
  { path: '/return-policy', priority: 0.8 },
  { path: '/services', priority: 0.8 },
  { path: '/terms-and-conditions', priority: 0.8 },
  { path: '/webinars', priority: 0.8 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = env.NEXT_PUBLIC_API_BASE_URL
  const payload = await getPayloadClient()

  const [blogs, services, quizzes, webinars, homeData] = await Promise.all([
    payload.find({ collection: 'blog', pagination: false }),
    payload.find({ collection: 'services', pagination: false }),
    payload.find({ collection: 'quiz', pagination: false }),
    payload.find({ collection: 'webinars', pagination: false }),
    payload.findGlobal({ slug: 'home' }),
  ])

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    priority,
  }))

  for (const blog of blogs.docs) {
    if (!blog.slug) continue
    entries.push({
      url: `${siteUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      priority: 0.8,
    })
  }

  const serviceSlugById = new Map(services.docs.map((service) => [service.id, service.slug]))
  for (const service of services.docs) {
    if (!service.slug) continue
    const parentSlug =
      typeof service.parent === 'object' && service.parent !== null
        ? service.parent.slug
        : service.parent
          ? serviceSlugById.get(service.parent)
          : null
    entries.push({
      url: parentSlug
        ? `${siteUrl}/services/${parentSlug}/${service.slug}`
        : `${siteUrl}/services/${service.slug}`,
      lastModified: service.updatedAt,
      priority: parentSlug ? 0.64 : 0.8,
    })
  }

  for (const quiz of quizzes.docs) {
    if (!quiz.slug) continue
    entries.push({
      url: `${siteUrl}/quiz/${quiz.slug}`,
      lastModified: quiz.updatedAt,
      priority: 0.8,
    })
  }

  for (const webinar of webinars.docs) {
    if (!webinar.slug) continue
    entries.push({
      url: `${siteUrl}/webinars/${webinar.slug}`,
      lastModified: webinar.updatedAt,
      priority: 0.64,
    })
  }

  for (const pkg of homeData.packagesSection?.availablePackages ?? []) {
    if (!pkg.slug) continue
    entries.push({
      url: `${siteUrl}/packages/${pkg.slug}`,
      priority: 0.8,
    })
    entries.push({
      url: `${siteUrl}/packages/${pkg.slug}/book`,
      priority: 0.64,
    })
  }

  return entries
}
