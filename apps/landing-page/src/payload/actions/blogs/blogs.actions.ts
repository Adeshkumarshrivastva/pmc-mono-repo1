'use server'

import { getPayloadClient } from '@/lib/payload'
import type { GetBlogInput, GetBlogsInput } from './blogs.input'

export async function getBlogs({ limit, sort, page, search, category }: GetBlogsInput = {}) {
  const payload = await getPayloadClient()

  const where: any = {}

  if (search) {
    where.title = {
      contains: search,
    }
  }

  if (category && category !== 'View All') {
    where['category.name'] = {
      equals: category,
    }
  }

  return payload.find({
    collection: 'blog',
    limit: limit || 6,
    sort: sort || '-publishedAt',
    page: page || 1,
    where,
  })
}

export async function getBlog({ blogSlug }: GetBlogInput) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'blog',
    where: {
      slug: {
        equals: blogSlug,
      },
    },
    limit: 1,
  })

  return result.docs[0] || null
}
