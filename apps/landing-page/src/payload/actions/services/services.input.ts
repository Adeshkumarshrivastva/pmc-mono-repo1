import { z } from 'zod'

export const getServicesInput = z.object({
  parentServiceSlug: z.string().optional(),
})

export type GetServicesInput = z.infer<typeof getServicesInput>

export const getServiceInput = z.object({
  serviceSlug: z.string(),
})

export type GetServiceInput = z.infer<typeof getServiceInput>
