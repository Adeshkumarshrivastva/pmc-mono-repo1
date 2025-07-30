'use server'

import { getPayloadClient } from '@/lib/payload'
import { GetBlogInput, GetBlogsInput } from './blogs.input'

export async function getBlogs({ limit, sort, page }: GetBlogsInput = {}) {
  const payload = await getPayloadClient()

  return payload.find({
    collection: 'blog',
    limit: limit || 6,
    sort: sort || '-publishedAt',
    page: page || 1,
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
