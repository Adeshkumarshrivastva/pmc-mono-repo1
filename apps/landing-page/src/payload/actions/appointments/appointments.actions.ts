'use server'

import { getPayloadClient } from '@/lib/payload'
import type { AppointmentFormInput, AppointmentFormUpdateInput, DeleteAppointmentInput } from './appointments.input'
import { zohoAPI } from '@/lib/zoho'

export async function createAppointment({ serviceId, subServiceId, dateTime, ...rest }: AppointmentFormInput) {
  const payload = await getPayloadClient()
  const amount = rest?.amount ? Number(rest.amount) : 0

  const date = new Date(dateTime).toLocaleString()

  await Promise.allSettled([
    payload.create({
      collection: 'appointments',
      data: {
        ...rest,
        amount,
        service: serviceId,
        subService: subServiceId,
        paymentStatus: 'unpaid',
        dateTime: date,
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
  ])

  return {
    message: 'Appointment created successfully.',
  }
}

export async function getAppointmentById(id: string) {
  const payload = await getPayloadClient()

  const appointment = await payload.findByID({
    collection: 'appointments',
    id,
  })

  return appointment
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
