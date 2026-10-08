import z from 'zod'

export const paymentConfirmationInput = z.object({
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number(),
        currency: z.string(),
        order_id: z.string(),
        contact: z.string(),
        email: z.email().optional().or(z.literal('')),
      }),
    }),
    order: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number(),
        currency: z.literal('INR'),
        status: z.literal('paid'),
        notes: z.object({
          bookingId: z.string(),
          serviceId: z.string(),
          serviceName: z.string(),
          servicePrice: z.number().positive(),
          expertId: z.string(),
          patientId: z.string(),
          paymentId: z.string(),
        }),
      }),
    }),
  }),
})

export type PaymentConfirmationInput = z.infer<typeof paymentConfirmationInput>

export const academyPurchaseConfirmationInput = z.object({
  payload: z.object({
    order: z.object({
      entity: z.object({
        id: z.string(),
        notes: z.object({
          purchaseId: z.string(),
          materialId: z.string(),
        }),
      }),
    }),
  }),
})

export type AcademyPurchaseConfirmationInput = z.infer<typeof academyPurchaseConfirmationInput>
