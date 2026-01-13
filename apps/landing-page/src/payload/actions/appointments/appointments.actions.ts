'use server'

import { getPayloadClient } from '@/lib/payload'
import type { AppointmentFormInput, AppointmentFormUpdateInput, DeleteAppointmentInput } from './appointments.input'
import { zohoAPI } from '@/lib/zoho'
import { sendWhatsappMessageByTemplate } from '@/lib/whatsapp'

export async function createAppointment({ serviceId, subServiceId, dateTime, ...rest }: AppointmentFormInput) {
  const payload = await getPayloadClient()
  const amount = rest?.amount ? Number(rest.amount) : 0

  const formattedDate = new Date(dateTime).toLocaleString()

  await Promise.allSettled([
    payload.create({
      collection: 'appointments',
      data: {
        ...rest,
        amount,
        service: serviceId,
        subService: subServiceId,
        paymentStatus: 'unpaid',
        dateTime: formattedDate,
      },
    }),

    payload.create({
      collection: 'leads',
      data: {
        fullName: rest.fullName,
        email: rest.email,
        phone: rest.phone,
      },
    }),

    zohoAPI.createLead({
      firstName: rest.fullName.split(' ')[0],
      lastName: rest.fullName.split(' ')[1] ?? rest.fullName,
      phone: rest.phone,
      email: rest.email,
      leadSource: 'Website',
    }),

    sendWhatsappMessageByTemplate({
      to: rest.phone,
      templateName: 'leads_trigger',
      templateValues: [rest.fullName],
    }),
  ])
}

export async function getAppointmentById(id: string) {
  const payload = await getPayloadClient()

  return await payload.findByID({
    collection: 'appointments',
    id,
  })
}

export async function updateAppointment({ id, ...rest }: AppointmentFormUpdateInput) {
  const payload = await getPayloadClient()

  return await payload.update({
    collection: 'appointments',
    where: {
      id: {
        equals: id,
      },
    },
    data: {
      ...rest,
    },
  })
}

export async function deleteAppointment({ id }: DeleteAppointmentInput) {
  const payload = await getPayloadClient()

  return await payload.delete({
    collection: 'appointments',
    id,
  })
}
