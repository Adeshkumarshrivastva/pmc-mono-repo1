'use server'

import { getPayloadClient } from '@/lib/payload'
import { ContactFormInput } from './contact-form.input'

export async function createContactFormSubmission(formInput: ContactFormInput) {
  const payload = await getPayloadClient()
  await payload.create({ collection: 'contact-submissions', data: formInput })
}
