import { z } from 'zod'

export const internshipsFormInput = z.object({
  fullName: z.string().min(3, 'Full Name is required'),
  email: z.email('Invalid email'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  schoolOrUniversity: z.string().optional(),
  degreeOrProgram: z.string().optional(),
  interestedIn: z.string().min(1),
  message: z.string().optional(),
})

export type InternshipsFormInput = z.infer<typeof internshipsFormInput>
