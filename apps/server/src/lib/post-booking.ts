import { render } from '@react-email/render'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { Resource } from 'sst'
import { createLogger } from './logger'
import { config } from '../config'
import { createGoogleCalendarEvent } from './google-calendar'
import { sendWhatsappMessageByTemplate } from './whatsapp'
import { getErrorMessage } from './utils'
import { getInPersonLocation } from './location'
import BookingConfirmationForExpert from '../emails/booking-confirmation-expert'
import BookingConfirmationForPatient from '../emails/booking-confirmation-patient'
import type { Booking, Expert, Patient, Service, User } from '../generated/prisma'

const sesClient = new SESv2Client()
const isDevelopment = Resource.App.stage !== 'production'
const logger = createLogger('post-booking')

type BookingWithRelations = Booking & {
  expert: Expert & {
    user: User
  }
  patient: Patient & {
    user: User
  }
  service: Service
}

type HandlePostBookingProps = {
  booking: BookingWithRelations
  orderId: string | null
}

type HandlePostBookingResult = {
  googleCalendarEvent: { eventId: string; meetLink: string | null } | null
}

export async function handlePostBooking(params: HandlePostBookingProps): Promise<HandlePostBookingResult> {
  const { booking, orderId } = params

  // Run all operations in parallel (non-blocking)
  const [googleCalendarEvent] = await Promise.all([
    createCalendarEvent(booking),
    sendEmailNotifications(booking, orderId),
    sendWhatsAppNotifications(booking),
  ])

  return { googleCalendarEvent }
}

async function createCalendarEvent(booking: BookingWithRelations) {
  try {
    const attendees = [booking.expert.user.email]
    if (booking.patientEmail) {
      attendees.push(booking.patientEmail)
    }

    const event = await createGoogleCalendarEvent({
      summary: booking.serviceName,
      // TODO: add more details - reschedule link, location, service details etc.
      description: `Booking with ${booking.expert.user.name} for ${booking.serviceName}`,
      startDateTime: booking.startDateTime,
      endDateTime: booking.endDateTime,
      attendees,
      isVirtual: booking.mode === 'VIRTUAL',
      inPersonLocation: getInPersonLocation(booking.inPersonLocation),
      bookingId: booking.id,
      organizerEmail: booking.expert.user.email,
    })

    logger.info(`Google Calendar Event created: eventId=${event.eventId}`)
    return event
  } catch (error) {
    logger.error(`Failed to create Google Calendar event: ${getErrorMessage(error)} [bookingId=${booking.id}]`)
    return null
  }
}

async function sendEmail(params: {
  to: string
  cc?: string[]
  subject: string
  htmlContent: string
  recipientType: 'expert' | 'patient'
  bookingId: string
}) {
  const { to, cc, subject, htmlContent, recipientType, bookingId } = params

  try {
    await sesClient.send(
      new SendEmailCommand({
        FromEmailAddress: config.email.emailSender,
        Destination: {
          ToAddresses: [to],
          CcAddresses: cc,
        },
        Content: {
          Simple: {
            Subject: { Data: subject },
            Body: { Html: { Data: htmlContent } },
          },
        },
      }),
    )
    logger.info(`Booking confirmation email sent to ${recipientType}: ${to}`)
  } catch (error) {
    logger.error(
      `Failed to send booking confirmation email to ${recipientType}: ${getErrorMessage(error)} [bookingId=${bookingId}]`,
    )
  }
}

async function sendEmailNotifications(booking: BookingWithRelations, orderId: string | null) {
  const emailPromises: Promise<void>[] = []

  // Send email to expert
  emailPromises.push(
    sendEmail({
      to: booking.expert.user.email,
      cc: isDevelopment ? [] : ['helpdesk@positivemindcare.com'],
      subject: `New Booking Confirmation - ${booking.serviceName}`,
      htmlContent: await render(BookingConfirmationForExpert({ booking, orderId })),
      recipientType: 'expert',
      bookingId: booking.id,
    }),
  )

  // Send email to patient if email is available
  if (booking.patientEmail) {
    emailPromises.push(
      sendEmail({
        to: booking.patientEmail,
        subject: `Booking Confirmed - ${booking.serviceName} with ${booking.expert.user.name}`,
        htmlContent: await render(BookingConfirmationForPatient({ booking, orderId })),
        recipientType: 'patient',
        bookingId: booking.id,
      }),
    )
  }

  await Promise.allSettled(emailPromises)
}

async function sendWhatsAppNotification(params: {
  to: string
  userName: string
  serviceName: string
  otherPartyName: string
  bookingId: string
  recipientType: 'expert' | 'patient'
}) {
  const { to, userName, serviceName, otherPartyName, bookingId, recipientType } = params

  try {
    await sendWhatsappMessageByTemplate({
      to,
      templateName: 'new_booking_confirmation',
      templateValues: [userName, serviceName, otherPartyName],
      urlParams: [bookingId],
    })
    logger.info(`WhatsApp notification sent to ${recipientType}: ${to}`)
  } catch (error) {
    logger.error(`Failed to send WhatsApp to ${recipientType}: ${getErrorMessage(error)} [bookingId=${bookingId}]`)
  }
}

async function sendWhatsAppNotifications(booking: BookingWithRelations) {
  const whatsappPromises: Promise<void>[] = []

  // Send WhatsApp to expert
  whatsappPromises.push(
    sendWhatsAppNotification({
      to: booking.expert.user.phoneNumber!,
      userName: booking.expert.user.name ?? '',
      serviceName: booking.serviceName,
      otherPartyName: booking.patientName ?? '',
      bookingId: booking.id,
      recipientType: 'expert',
    }),
  )

  // Send WhatsApp to patient if phone number is available
  if (booking.patient.user.phoneNumber) {
    whatsappPromises.push(
      sendWhatsAppNotification({
        to: booking.patient.user.phoneNumber,
        userName: booking.patientName,
        serviceName: booking.serviceName,
        otherPartyName: booking.expert.user.name ?? 'Expert',
        bookingId: booking.id,
        recipientType: 'patient',
      }),
    )
  } else {
    logger.warn(`Patient phone number missing, skipping WhatsApp: patientId=${booking.patient.id}`)
  }

  await Promise.allSettled(whatsappPromises)
}
