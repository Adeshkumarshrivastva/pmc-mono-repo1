import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import type { AcademyPurchaseConfirmationInput, PaymentConfirmationInput } from './webhooks.input'
import { createLogger } from '../../lib/logger'
import { getErrorMessage } from '../../lib/utils'
import { handlePostBooking } from '../../lib/post-booking'

const logger = createLogger('webhook-service')

export async function paymentConfirmation(c: C, input: PaymentConfirmationInput) {
  const { order } = input.payload
  const { bookingId, paymentId } = order.entity.notes
  const razorpayOrderId = order.entity.id

  try {
    // Validate payment exists and is in correct state
    const existingPayment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
        bookingId: bookingId,
      },
    })

    if (!existingPayment || !existingPayment.razorpayOrderId) {
      logger.warn(`Payment not found: paymentId=${paymentId}, bookingId=${bookingId}`)
      return c.json({ error: 'Payment not found' }, 404)
    }

    // Verify Razorpay order ID matches
    if (existingPayment.razorpayOrderId !== razorpayOrderId) {
      logger.error(
        `Razorpay order ID mismatch: expected=${existingPayment.razorpayOrderId}, received=${razorpayOrderId}`,
      )
      return c.json({ error: 'Payment order ID mismatch' }, 400)
    }

    // If already processed, return success
    if (existingPayment.status !== 'PENDING') {
      logger.info(`Payment already processed: paymentId=${paymentId}, status=${existingPayment.status}`)
      return c.json({ success: true, message: 'Payment already processed' })
    }

    // Fetch booking with all required relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        expert: {
          include: {
            user: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        service: true,
      },
    })

    if (!booking) {
      logger.warn(`Booking not found: bookingId=${bookingId}`)
      return c.json({ error: 'Booking not found' }, 404)
    }

    const { googleCalendarEvent } = await handlePostBooking({
      booking,
      orderId: existingPayment.razorpayOrderId,
    })

    // Update booking and payment status in a transaction
    await prisma.$transaction([
      prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: 'BOOKED',
          virtualLocation:
            booking.mode === 'VIRTUAL' && googleCalendarEvent?.meetLink
              ? {
                  type: 'google_meet',
                  meetLink: googleCalendarEvent.meetLink,
                }
              : null,
          calendarEventId: googleCalendarEvent?.eventId ?? null,
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

    logger.info(`Booking confirmed: bookingId=${bookingId}, paymentId=${paymentId}`)

    return c.json({ success: true, message: 'Payment confirmed and notifications sent' })
  } catch (error) {
    logger.error(
      `Payment confirmation webhook failed: ${getErrorMessage(error)} [bookingId=${bookingId}, paymentId=${paymentId}, razorpayOrderId=${razorpayOrderId}]`,
    )
    return c.json({ error: 'Internal server error' }, 500)
  }
}

/**
 * Confirms an academy material purchase. Kept as its own webhook route
 * rather than folded into `paymentConfirmation` above: the two raise orders
 * with differently-shaped `notes` (booking/service ids vs. purchase/material
 * ids), and `paymentConfirmationInput` requires its own notes shape — a
 * second route is simpler than making one input schema cover both.
 */
export async function academyPurchaseConfirmation(c: C, input: AcademyPurchaseConfirmationInput) {
  const { purchaseId, materialId } = input.payload.order.entity.notes
  const razorpayOrderId = input.payload.order.entity.id

  try {
    const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } })

    if (!purchase || purchase.materialId !== materialId) {
      logger.warn(`Academy purchase not found: purchaseId=${purchaseId}, materialId=${materialId}`)
      return c.json({ error: 'Purchase not found' }, 404)
    }

    if (purchase.razorpayOrderId !== razorpayOrderId) {
      logger.error(
        `Razorpay order ID mismatch: expected=${purchase.razorpayOrderId}, received=${razorpayOrderId}`,
      )
      return c.json({ error: 'Purchase order ID mismatch' }, 400)
    }

    if (purchase.status !== 'PENDING') {
      logger.info(`Academy purchase already processed: purchaseId=${purchaseId}, status=${purchase.status}`)
      return c.json({ success: true, message: 'Payment already processed' })
    }

    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { status: 'PAID', paidAt: new Date() },
    })

    logger.info(`Academy purchase confirmed: purchaseId=${purchaseId}, materialId=${materialId}`)

    return c.json({ success: true, message: 'Payment confirmed' })
  } catch (error) {
    logger.error(
      `Academy purchase confirmation webhook failed: ${getErrorMessage(error)} [purchaseId=${purchaseId}, materialId=${materialId}, razorpayOrderId=${razorpayOrderId}]`,
    )
    return c.json({ error: 'Internal server error' }, 500)
  }
}
