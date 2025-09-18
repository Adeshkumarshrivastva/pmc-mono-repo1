import { render } from '@react-email/components'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import z from 'zod'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import type { PaymentConfirmationInput } from './webhooks.input'
import BookingConfirmationForExpert from '../../emails/booking-confirmation-expert'
import BookingConfirmationForPatient from '../../emails/booking-confirmation-patient'

const { EMAIL_SENDER } = z.object({ EMAIL_SENDER: z.email() }).parse(process.env)

const sesClient = new SESv2Client()

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
      return c.json({ error: 'Booking not found' }, 404)
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

    const emailPromises = [
      sesClient.send(
        new SendEmailCommand({
          FromEmailAddress: EMAIL_SENDER,
          Destination: {
            ToAddresses: [booking.expert.user.email],
          },
          Content: {
            Simple: {
              Subject: {
                Data: `New Booking Confirmation - ${booking.serviceName}`,
              },
              Body: {
                Html: {
                  Data: await render(BookingConfirmationForExpert({ booking })),
                },
              },
            },
          },
        }),
      ),
    ]

    const patientEmail = booking.patientEmail || booking.patient.user.email
    if (patientEmail) {
      emailPromises.push(
        sesClient.send(
          new SendEmailCommand({
            FromEmailAddress: EMAIL_SENDER,
            Destination: {
              ToAddresses: [patientEmail],
            },
            Content: {
              Simple: {
                Subject: {
                  Data: `Booking Confirmed - ${booking.serviceName} with Dr. ${booking.expert.user.name}`,
                },
                Body: {
                  Html: {
                    Data: await render(BookingConfirmationForPatient({ booking })),
                  },
                },
              },
            },
          }),
        ),
      )
    }

    await Promise.allSettled(emailPromises)

    return c.json({ success: true, message: 'Payment confirmed and emails sent' })
  } catch (error) {
    console.error('Error in payment confirmation:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
