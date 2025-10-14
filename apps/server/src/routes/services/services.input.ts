import z from 'zod'

export const createServiceInput = z.object({
  name: z.string().min(1, 'Service name is required'),
  slug: z.string().min(1, 'Slug is required'),
  availableModes: z.array(z.enum(['IN_PERSON', 'VIRTUAL'])).min(1, 'At least one mode is required'),
  inPersonLocation: z.any().optional(),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  description: z.string().default(''),
  bufferTimeBeforeInMinutes: z.number().min(0).default(30),
  bufferTimeAfterInMinutes: z.number().min(0).default(30),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('INR'),
  isPartialPaymentAvailable: z.boolean().default(false),
  minPaymentAmount: z.number().min(0).optional().default(0),
  durationInMinutes: z.number().min(15, 'Duration must be at least 15 minutes').default(60),
  tags: z.array(z.string()).default([]),
})

export const updateServiceInput = createServiceInput.partial().extend({
  serviceId: z.string().min(1, 'Service ID is required'),
})

export const deleteServiceInput = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
})

export const getServiceInput = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
})

export type CreateServiceInput = z.infer<typeof createServiceInput>
export type UpdateServiceInput = z.infer<typeof updateServiceInput>
export type DeleteServiceInput = z.infer<typeof deleteServiceInput>
export type GetServiceInput = z.infer<typeof getServiceInput>
