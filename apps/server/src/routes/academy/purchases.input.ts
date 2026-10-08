import z from 'zod'

export const createPurchaseOrderInput = z.object({
  materialId: z.string().min(1, 'Material id is required'),
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('A valid email is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  reason: z.string().trim().min(1, 'Reason is required'),
})

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderInput>
