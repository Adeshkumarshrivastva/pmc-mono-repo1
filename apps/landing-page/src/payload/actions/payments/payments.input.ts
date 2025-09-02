import { z } from 'zod'

export const createOrderInput = z.object({
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(3).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderInput>
