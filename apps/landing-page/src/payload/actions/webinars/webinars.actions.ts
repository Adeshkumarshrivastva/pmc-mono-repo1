'use server'

import { getPayloadClient } from '@/lib/payload'
import type { GetWebinarsInput, GetWebinarInput } from './webinars.input'

export async function getWebinars({ limit, sort, page, search }: GetWebinarsInput) {
  const payload = await getPayloadClient()
  const where = search ? { title: { contains: search } } : undefined

  return payload.find({
    collection: 'webinars',
    limit: limit || undefined,
    sort: sort || '-date',
    page: page || 1,
    where,
  })
}

export async function getWebinar({ webinarSlug }: GetWebinarInput) {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'webinars',
    where: {
      slug: { equals: webinarSlug },
    },
    limit: 1,
  })

  return result.docs[0] || null
}
