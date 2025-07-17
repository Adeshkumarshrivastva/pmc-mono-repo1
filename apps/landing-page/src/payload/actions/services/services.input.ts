import { z } from 'zod/v4'

export const getServicesInput = z.object({
  parentServiceId: z.string().optional(),
})

export type GetServicesInput = z.infer<typeof getServicesInput>
