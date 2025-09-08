import z from 'zod'
import { ServiceMode } from '../../generated/prisma'

export const initiatePatientAuthInput = z.object({
  phoneNumber: z.string(),
})
export type InitiatePatientAuthInput = z.infer<typeof initiatePatientAuthInput>

export const verifyPatientInput = z.object({
  otp: z.string(),
})
export type VerifyPatientInput = z.infer<typeof verifyPatientInput>

export const createBookingInput = z.object({
  expertId: z.string(),
  serviceId: z.string(),
  patientId: z.string(),
  startDateTime: z.string(),
  mode: z.enum(ServiceMode),
  prebookingQnA: z
    .object({
      question: z.string(),
      format: z.enum(['TEXT', 'LONG_TEXT']),
      answer: z.string(),
    })
    .optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingInput>
