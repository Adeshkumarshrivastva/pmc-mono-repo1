'use server'

import { getPayloadClient } from '@/lib/payload'
import { type LeadFormInput, type QuizLeadFormInput, type FranchiseFormInput } from './leads.input'
import { zohoAPI } from '@/lib/zoho'
import { sendWhatsappMessageByTemplate } from '@/lib/whatsapp'

export async function createLead({ service, ...rest }: LeadFormInput) {
  const payload = await getPayloadClient()

  await Promise.allSettled([
    payload.create({
      collection: 'leads',
      data: {
        ...rest,
        serviceName: service,
      },
    }),
    zohoAPI.createLead({
      lastName: rest.fullName.split(' ')[1] ?? rest.fullName,
      firstName: rest.fullName.split(' ')[0],
      email: rest.email,
      phone: rest.phone,
      leadSource: 'Website',
      description: rest.message,
      service,
      subService: '',
    }),
    sendWhatsappMessageByTemplate({
      to: rest.phone,
      templateName: 'leads_trigger',
      templateValues: [rest.fullName],
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

export async function createFranchiseRequest({ fullName, email, phone, message }: FranchiseFormInput) {
  const payload = await getPayloadClient()
  await Promise.all([
    payload.create({
      collection: 'franchiseRequest',
      data: {
        fullName,
        email,
        phone,
        message,
        source: ['website'],
      },
    }),
  ])
  return { success: true }
}
