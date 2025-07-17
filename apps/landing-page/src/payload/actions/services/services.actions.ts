'use server'

import { getPayloadClient } from '@/lib/payload'
import { GetServicesInput } from './services.input'

export async function getServices({ parentServiceId }: GetServicesInput) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'services',
    pagination: false,
    where: {
      parent: {
        equals: parentServiceId ?? null,
      },
    },
  })
}
