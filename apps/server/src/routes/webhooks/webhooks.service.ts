import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import type { PaymentConfirmationInput } from './webhooks.input'

export async function paymentConfirmation(c: C, input: PaymentConfirmationInput) {
  const { order } = input.payload
  const { bookingId, paymentId } = order.entity.notes

  try {
    const existingPayment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
        bookingId: bookingId,
      },
    })

    if (!existingPayment) {
      return c.json({ error: 'Payment not found' }, 404)
    }

    if (existingPayment.status !== 'PENDING') {
      return c.json({ success: true, message: 'Existing payment is not in pending state' })
    }
    await prisma.$transaction([
      prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: 'BOOKED',
        },
      }),
      prisma.payment.update({
        where: {
          id: paymentId,
          bookingId: bookingId,
        },
        data: {
          status: 'COMPLETED',
        },
      }),
    ])

    // TODO: Create Google Calendar event

    // TODO: Send email & whatsapp message to expert

    // TODO: Send email & whatsapp message to patient

    return c.json({ success: true, message: 'Payment confirmed' })
  } catch {
    return c.json({ error: 'Internal server error' }, 500)
  }
}
