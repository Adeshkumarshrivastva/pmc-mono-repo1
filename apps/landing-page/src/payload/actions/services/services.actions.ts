'use server'

import { getPayloadClient } from '@/lib/payload'
import type { GetServiceInput, GetServicesInput } from './services.input'

export async function getServices({ parentServiceSlug }: GetServicesInput) {
  const payload = await getPayloadClient()
  let parentServiceId = null
  if (parentServiceSlug) {
    const service = await payload.find({
      collection: 'services',
      where: {
        slug: {
          equals: parentServiceSlug,
        },
      },
      limit: 1,
      pagination: false,
    })

    if (!service.docs.length) {
      return {
        docs: [],
        totalDocs: 0,
        limit: 0,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      } as any
    }

    parentServiceId = service.docs[0].id
  }

  return payload.find({
    collection: 'services',
    pagination: false,
    where: {
      parent: {
        equals: parentServiceId,
      },
    },
  })
}

export async function getService({ serviceSlug }: GetServiceInput) {
  const payload = await getPayloadClient()

  const service = await payload.find({
    collection: 'services',
    where: {
      slug: {
        equals: serviceSlug,
      },
    },
    pagination: false,
    limit: 1,
  })

  return service.docs[0]
}
