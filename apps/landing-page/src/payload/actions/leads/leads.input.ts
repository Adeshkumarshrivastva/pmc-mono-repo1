import { z } from 'zod/v4'
import { objectId } from '@/lib/validation'

export const leadFormInput = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  serviceId: objectId,
  subServiceId: z.union([objectId, z.literal('')]),
  message: z.string().min(1),
})

export type LeadFormInput = z.infer<typeof leadFormInput>
