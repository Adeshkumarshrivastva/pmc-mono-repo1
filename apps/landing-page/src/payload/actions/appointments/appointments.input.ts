import { z } from 'zod'
import { objectId } from '@/lib/validation'

export const appointmentFormInput = z.object({
  fullName: z.string().min(1).max(100),
  email: z.union([z.email(), z.literal('')]).optional(),
  phone: z.string().min(10).max(15),
  serviceId: z.union([objectId, z.literal('')]),
  subServiceId: z.union([objectId, z.literal('')]),
  dateTime: z.string().min(1),
  amount: z.string().refine((val) => !isNaN(Number(val))),
  message: z.string().optional(),
})

export type AppointmentFormInput = z.infer<typeof appointmentFormInput>

export const appointmentFormUpdateInput = appointmentFormInput
  .pick({
    fullName: true,
    email: true,
    phone: true,
    dateTime: true,
    message: true,
  })
  .partial()
  .extend({
    paymentStatus: z.enum(['unpaid', 'pending', 'paid', 'failed']).optional(),
    id: objectId,
  })

export type AppointmentFormUpdateInput = z.infer<typeof appointmentFormUpdateInput>

export const deleteAppointmentInput = z.object({
  id: objectId,
})
export type DeleteAppointmentInput = z.infer<typeof deleteAppointmentInput>
