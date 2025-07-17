'use server'

import { getPayloadClient } from '@/lib/payload'
import { LeadFormInput } from './leads.input'

export async function createLead({ serviceId, subServiceId, ...rest }: LeadFormInput) {
  const payload = await getPayloadClient()
  await payload.create({
    collection: 'leads',
    data: {
      ...rest,
      service: serviceId,
      subService: subServiceId,
    },
  })
}
