import { z } from 'zod/v4'

export const appointmentFormInput = z.object({
  fullName: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().min(10),
  date: z.string(),
  time: z.string(),
})

export type AppointmentFormInput = z.infer<typeof appointmentFormInput>
