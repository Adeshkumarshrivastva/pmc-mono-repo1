import z from 'zod'

export const patientBookingsSearchQuery = z.object({
  period: z.enum(['upcoming', 'past', 'fixed']),
  // startDate and endDate are only for fixed period
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type PatientBookingsSearchQuery = z.infer<typeof patientBookingsSearchQuery>

export const updatePatientInput = z.object({
  name: z.string().min(3),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().min(10),
  timezone: z.string(),
})

export type UpdatePatientInput = z.infer<typeof updatePatientInput>

export const sendTrialSessionEmailInput = z.object({
  name: z.string().min(3),
  phoneNumber: z.string().min(10).max(15),
  email: z.string().email().optional(),
  date: z.string(),
})

export type SendTrialSessionEmailInput = z.infer<typeof sendTrialSessionEmailInput>
