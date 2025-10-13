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
import { createGoogleCalendarEvent } from '../../lib/google-calendar'
import { getErrorMessage } from '../../lib/utils'

const sesClient = new SESv2Client()

const isDevelopment = Resource.App.stage !== 'production'
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

    //  Create Google Calendar event
    let googleCalendarEvent: { eventId: string; meetLink: string | null } | null = null
    try {
      const attendees = [booking.expert.user.email]
      if (booking.patientEmail) {
        attendees.push(booking.patientEmail)
      }

      googleCalendarEvent = await createGoogleCalendarEvent({
        summary: booking.serviceName,
        description: `Booking with ${booking.expert.user.name} for ${booking.serviceName}`,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        attendees,
        isVirtual: booking.mode === 'VIRTUAL',
      })

      logger.info(`Google Calendar Event created: eventId=${googleCalendarEvent.eventId}`)
    } catch (error) {
      logger.error(`Failed to create Google Calendar event: ${getErrorMessage(error)} [bookingId=${bookingId}]`)
      // Continue processing - we'll update the booking without calendar event
    }

    //  Update booking and payment status in a transaction
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

    // Email notifications
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
        .then(() => {
          logger.info(`Booking confirmation email sent to expert: ${booking.expert.user.email}`)
        })
        .catch((error) => {
          logger.error(
            `Failed to send booking confirmation email to expert: ${getErrorMessage(error)} [bookingId=${bookingId}]`,
          )
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
          .then(() => {
            logger.info(`Booking confirmation email sent to patient: ${booking.patientEmail}`)
          })
          .catch((error) => {
            logger.error(
              `Failed to send booking confirmation email to patient: ${getErrorMessage(error)} [bookingId=${bookingId}]`,
            )
            return null
          }),
      )
    }

    // WhatsApp notifications
    const whatsappPromises = []

    whatsappPromises.push(
      sendWhatsappMessageByTemplate({
        to: booking.expert.user.phoneNumber!,
        templateName: 'new_booking_confirmation',
        templateValues: [booking.expert.user.name ?? '', booking.serviceName, booking.patientName ?? ''],
        urlParams: [booking.id],
      })
        .then(() => {
          logger.info(`WhatsApp notification sent to expert: ${booking.expert.user.phoneNumber}`)
        })
        .catch((error) => {
          logger.error(`Failed to send WhatsApp to expert: ${getErrorMessage(error)} [bookingId=${bookingId}]`)
          return null
        }),
    )

    if (booking.patient.user.phoneNumber) {
      whatsappPromises.push(
        sendWhatsappMessageByTemplate({
          to: booking.patient.user.phoneNumber,
          templateName: 'new_booking_confirmation',
          templateValues: [booking.patientName, booking.serviceName, booking.expert.user.name ?? 'Expert'],
          urlParams: [booking.id],
        })
          .then(() => {
            logger.info(`WhatsApp notification sent to patient: ${booking.patient.user.phoneNumber}`)
          })
          .catch((error) => {
            logger.error(`Failed to send WhatsApp to patient: ${getErrorMessage(error)} [bookingId=${bookingId}]`)
            return null
          }),
      )
    } else {
      logger.warn(`Patient phone number missing, skipping WhatsApp: patientId=${booking.patient.id}`)
    }

    // Wait for all notifications to complete (don't block webhook response on notification failures)
    await Promise.allSettled([...emailPromises, ...whatsappPromises])

    return c.json({ success: true, message: 'Payment confirmed and notifications sent' })
  } catch (error) {
    logger.error(
      `Payment confirmation webhook failed: ${getErrorMessage(error)} [bookingId=${bookingId}, paymentId=${paymentId}, razorpayOrderId=${razorpayOrderId}]`,
    )
    return c.json({ error: 'Internal server error' }, 500)
  }
}
