import type { MetadataRoute } from 'next'
import { env } from '@/env'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = env.NEXT_PUBLIC_API_BASE_URL

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/quiz/*/report'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
