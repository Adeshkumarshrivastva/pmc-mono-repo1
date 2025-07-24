'use server'

import { getPayloadClient } from '@/lib/payload'
import { AppointmentFormInput } from './appointments.input'

export async function createAppointment({ ...rest }: AppointmentFormInput) {
  const payload = await getPayloadClient()
  await payload.create({
    collection: 'appointments',
    data: {
      ...rest,
    },
  })
}
