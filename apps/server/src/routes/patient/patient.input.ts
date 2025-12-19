import z from 'zod'

export const patientBookingsSearchQuery = z.object({
  period: z.enum(['upcoming', 'past', 'fixed']),
  // startDate and endDate are only for fixed period
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type PatientBookingsSearchQuery = z.infer<typeof patientBookingsSearchQuery>
