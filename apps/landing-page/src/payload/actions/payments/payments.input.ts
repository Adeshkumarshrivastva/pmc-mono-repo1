import { z } from 'zod/v4'

export const createOrderInput = z.object({
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(3).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderInput>
