import z from 'zod'
import { ServiceMode } from '../../generated/prisma'

export const createBookingInput = z.object({
  expertId: z.string(),
  serviceId: z.string(),
  startDateTime: z.date(),
  mode: z.enum(ServiceMode),
  patientName: z.string().min(3).max(100),
  patientEmail: z.email().optional(),
  prebookingQnA: z
    .object({
      question: z.string(),
      format: z.enum(['TEXT', 'LONG_TEXT']),
      answer: z.string(),
    })
    .optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingInput>
