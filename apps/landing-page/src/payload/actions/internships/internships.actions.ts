'use server'

import { getPayloadClient } from '@/lib/payload'
import type { InternshipsFormInput } from './internships.input'
import { internshipsFormInput } from './internships.input'

export async function createInternship(data: InternshipsFormInput) {
  const payload = await getPayloadClient()
  const validatedData = internshipsFormInput.parse(data)

  const internship = await payload.create({
    collection: 'internships',
    data: validatedData,
  })

  return {
    internshipId: internship.id,
    message: 'Internship application submitted successfully.',
  }
}
