import { z } from 'zod/v4'

export const contactFormInput = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  message: z.string().min(1),
})

export type ContactFormInput = z.infer<typeof contactFormInput>
