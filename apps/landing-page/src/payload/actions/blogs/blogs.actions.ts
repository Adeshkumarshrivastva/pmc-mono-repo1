'use server'

import { getPayloadClient } from '@/lib/payload'
import { GetBlogInput, GetBlogsInput } from './blogs.input'

export async function getBlogs({ limit, sort }: GetBlogsInput = {}) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'blog',
    limit: limit || 100,
    sort: sort || '-publishedAt',
    pagination: false,
  })
}

export async function getBlog({ blogId }: GetBlogInput) {
  const payload = await getPayloadClient()

  const blog = await payload.findByID({
    collection: 'blog',
    id: blogId,
  })

  return blog
}
