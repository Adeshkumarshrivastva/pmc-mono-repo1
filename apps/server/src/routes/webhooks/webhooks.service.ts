import { render } from '@react-email/render'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

import { Resource } from 'sst'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import type { PaymentConfirmationInput } from './webhooks.input'
import BookingConfirmationForExpert from '../../emails/booking-confirmation-expert'
import BookingConfirmationForPatient from '../../emails/booking-confirmation-patient'
import { sendWhatsappMessageByTemplate } from '../../lib/whatsapp'
import { config } from '../../config'
import { createLogger } from '../../lib/logger'

const sesClient = new SESv2Client()

const isDevelopment = Resource.App.stage !== 'production'
const logger = createLogger('webhook-service')

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

    if (!existingPayment || !existingPayment.razorpayOrderId) {
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
      sesClient
        .send(
          new SendEmailCommand({
            FromEmailAddress: config.email.emailSender,
            Destination: {
              ToAddresses: [booking.expert.user.email],
              CcAddresses: isDevelopment ? [] : ['helpdesk@positivemindcare.com'],
            },
            Content: {
              Simple: {
                Subject: {
                  Data: `New Booking Confirmation - ${booking.serviceName}`,
                },
                Body: {
                  Html: {
                    Data: await render(
                      BookingConfirmationForExpert({ booking, orderId: existingPayment.razorpayOrderId }),
                    ),
                  },
                },
              },
            },
          }),
        )
        .catch((error) => {
          logger.error(`Failed to send booking confirmation email to expert: ${error}`)
          return null
        }),
    ]

    if (booking.patientEmail) {
      emailPromises.push(
        sesClient
          .send(
            new SendEmailCommand({
              FromEmailAddress: config.email.emailSender,
              Destination: {
                ToAddresses: [booking.patientEmail],
              },
              Content: {
                Simple: {
                  Subject: {
                    Data: `Booking Confirmed - ${booking.serviceName} with ${booking.expert.user.name}`,
                  },
                  Body: {
                    Html: {
                      Data: await render(
                        BookingConfirmationForPatient({ booking, orderId: existingPayment.razorpayOrderId }),
                      ),
                    },
                  },
                },
              },
            }),
          )
          .catch((error) => {
            logger.error(`Failed to send booking confirmation email to patient: ${error}`)
            return null
          }),
      )
    }

    // Send WhatsApp messages in parallel with emails
    const whatsappPromises = []

    whatsappPromises.push(
      sendWhatsappMessageByTemplate({
        to: booking.expert.user.phoneNumber!,
        templateName: 'new_booking_confirmation',
        templateValues: [booking.expert.user.name ?? '', booking.serviceName, booking.patientName ?? ''],
        urlParams: [booking.id],
      }).catch((error) => {
        logger.error(`Failed to send WhatsApp to expert: ${error}`)
        return null
      }),
    )

    whatsappPromises.push(
      sendWhatsappMessageByTemplate({
        to: booking.patient.user.phoneNumber!,
        templateName: 'new_booking_confirmation',
        templateValues: [booking.patientName, booking.serviceName, booking.expert.user.name ?? 'Expert'],
        urlParams: [booking.id],
      }).catch((error) => {
        logger.error(`Failed to send WhatsApp to patient: ${error}`)
        return null
      }),
    )

    // Wait for all notifications to complete (emails and WhatsApp)
    await Promise.allSettled([...emailPromises, ...whatsappPromises])

    return c.json({ success: true, message: 'Payment confirmed and emails sent' })
  } catch {
    return c.json({ error: 'Internal server error' }, 500)
  }
}
