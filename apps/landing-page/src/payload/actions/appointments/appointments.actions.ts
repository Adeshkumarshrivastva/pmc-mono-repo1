'use server'

import { getPayloadClient } from '@/lib/payload'
import { AppointmentFormInput, AppointmentFormUpdateInput, DeleteAppointmentInput } from './appointments.input'
import { createOrder } from '../payments/payments.action'

export async function createAppointment({ serviceId, subServiceId, ...rest }: AppointmentFormInput) {
  const payload = await getPayloadClient()
  const amount = rest?.amount ? Number(rest.amount) : 0
  const appointment = await payload.create({
    collection: 'appointments',
    data: {
      ...rest,
      amount,
      service: serviceId,
      subService: subServiceId,
      paymentStatus: 'unpaid',
    },
  })

  if (appointment && amount && amount > 0) {
    try {
      const order = await createOrder({
        amount: amount,
      })

      await payload.update({
        collection: 'appointments',
        where: {
          id: {
            equals: appointment.id,
          },
        },
        data: {
          orderId: order.orderId,
          paymentStatus: 'pending',
        },
      })

      return {
        orderId: order.orderId,
        amount,
        appointmentId: appointment.id,
        message: 'Appointment created successfully, please complete the payment.',
      }
    } catch (error) {
      await payload.delete({
        collection: 'appointments',
        id: appointment.id,
      })

      return {
        error: 'Failed to create payment order. Please try again later.',
      }
    }
  } else {
    return {
      appointmentId: appointment.id,
      message: 'Appointment created successfully.',
    }
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
