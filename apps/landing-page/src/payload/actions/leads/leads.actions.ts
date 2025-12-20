'use server'

import { getPayloadClient } from '@/lib/payload'
import { type LeadFormInput, type QuizLeadFormInput } from './leads.input'
import { zohoAPI } from '@/lib/zoho'

export async function createLead({ serviceId, subServiceId, ...rest }: LeadFormInput) {
  const payload = await getPayloadClient()

  const serviceQuery = await payload.find({
    collection: 'services',
    where: {
      id: {
        in: subServiceId ? [serviceId, subServiceId] : [serviceId],
      },
    },
    select: {
      name: true,
    },
  })

  const service = serviceQuery.docs.find((s) => s.id === serviceId)
  const subService = subServiceId ? serviceQuery.docs.find((s) => s.id === subServiceId) : null

  await Promise.allSettled([
    payload.create({
      collection: 'leads',
      data: {
        ...rest,
        service: serviceId,
        subService: subServiceId,
      },
    }),
    zohoAPI.createLead({
      lastName: rest.fullName.split(' ')[1] ?? rest.fullName,
      firstName: rest.fullName.split(' ')[0],
      email: rest.email,
      phone: rest.phone,
      leadSource: 'Website',
      description: rest.message,
      service: service?.name,
      subService: subService?.name,
    }),
  ])

  return { success: true }
}

export async function createQuizLead({ fullName, email, phone, quizAnswers, quizName, quizId }: QuizLeadFormInput) {
  const payload = await getPayloadClient()
  await Promise.all([
    payload.create({
      collection: 'leads',
      data: {
        fullName,
        email,
        phone,
        quizAnswers,
        quizId,
      },
    }),
    zohoAPI.createLead({
      lastName: fullName.split(' ')[1] ?? fullName,
      firstName: fullName.split(' ')[0],
      email,
      phone,
      leadSource: 'Website Quiz',
      quizName,
      quizAnswers: JSON.stringify(quizAnswers?.map((q) => ({ question: q.question, answer: q.answer }))),
    }),
  ])
  return { success: true }
}
