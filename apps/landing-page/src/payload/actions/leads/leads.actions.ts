'use server'

import { getPayloadClient } from '@/lib/payload'
import { type LeadFormInput, type QuizLeadFormInput } from './leads.input'

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
export async function createQuizLead({ fullName, email, phone, quizAnswers }: QuizLeadFormInput) {
  const payload = await getPayloadClient()
  await payload.create({
    collection: 'leads',
    data: {
      fullName,
      email,
      phone,
      quizAnswers,
    },
  })
}
