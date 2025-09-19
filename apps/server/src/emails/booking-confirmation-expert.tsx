/** @jsxImportSource react */

import { Container, Font, Html, Heading, Text, Section, Row, Column, Button, Tailwind } from '@react-email/components'
import { type Booking, type Expert, type Service, type Patient, type User, ServiceMode } from '../generated/prisma'
import { formatDateTime, formatCurrency, getInPersonAddress, getVirtualMeetingLink, getPreBookingQnA } from './lib'

type BookingWithRelations = Booking & {
  expert: Expert & {
    user: User
  }
  patient: Patient & {
    user: User
  }
  service: Service
}

type BookingConfirmationProps = {
  booking: BookingWithRelations
}

export default function BookingConfirmationForExpert({ booking }: BookingConfirmationProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            fontFamily: {
              display: ['"Bricolage Grotesque"', 'sans-serif'],
              sans: ['"Geist"', 'sans-serif'],
            },
          },
        },
      }}
    >
      <Html className="font-sans">
        <Font
          fontFamily="Bricolage Grotesque"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/bricolagegrotesque/v8/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGIInE.woff2',
            format: 'woff2',
          }}
        />
        <Font
          fontFamily="Geist"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/geist/v3/gyByhwUxId8gMEwcGFU.woff2',
            format: 'woff2',
          }}
        />
        <Container className="bg-white max-w-2xl mx-auto">
          <Section className="bg-emerald-500 p-8 text-center text-white">
            <Heading className="font-display text-2xl m-0 text-white">New Booking Confirmation</Heading>
            <Text className="text-lg opacity-90 mb-0 text-white">You have a new appointment scheduled</Text>
          </Section>

          <Section className="p-8">
            <Text className="text-lg mb-6">Hi Dr. {booking.expert.user.name || 'Doctor'},</Text>

            <Text className="text-base mb-6">
              You have a new booking for <strong>{booking.serviceName}</strong>. Here are the details:
            </Text>

            <Section className="bg-gray-50 rounded-lg p-6 mb-6">
              <Heading className="font-sans text-xl text-gray-900 mb-4">Appointment Details</Heading>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Patient:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{booking.patientName}</Text>
                </Column>
              </Row>

              {(booking.patientEmail || booking.patient.user.email) && (
                <Row className="mb-3">
                  <Column className="w-1/3">
                    <Text className="text-sm text-gray-600 font-semibold m-0">Email:</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-sm text-gray-900 m-0">
                      {booking.patientEmail || booking.patient.user.email}
                    </Text>
                  </Column>
                </Row>
              )}

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Service:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{booking.serviceName}</Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Date & Time:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{formatDateTime(booking.startDateTime)}</Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Mode:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">
                    {booking.mode === ServiceMode.VIRTUAL ? 'Virtual Session' : 'In-Person'}
                  </Text>
                </Column>
              </Row>

              {booking.mode === ServiceMode.IN_PERSON && getInPersonAddress({ booking }) && (
                <Row className="mb-3">
                  <Column className="w-1/3">
                    <Text className="text-sm text-gray-600 font-semibold m-0">Location:</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-sm text-gray-900 m-0">{getInPersonAddress({ booking })}</Text>
                  </Column>
                </Row>
              )}

              {booking.mode === ServiceMode.VIRTUAL && getVirtualMeetingLink({ booking }) && (
                <Row className="mb-3">
                  <Column className="w-1/3">
                    <Text className="text-sm text-gray-600 font-semibold m-0">Meeting Link:</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Button
                      href={getVirtualMeetingLink({ booking }) || undefined}
                      className="bg-blue-600 text-white py-2 px-4 rounded text-sm no-underline"
                    >
                      Join Meeting
                    </Button>
                  </Column>
                </Row>
              )}

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Fee:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">
                    {formatCurrency(booking.servicePrice, booking.serviceCurrency)}
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Booking ID:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">#{booking.id.slice(-8).toUpperCase()}</Text>
                </Column>
              </Row>
            </Section>

            {getPreBookingQnA({ booking }).length > 0 && (
              <Section className="bg-blue-50 rounded-lg p-6 mb-6">
                <Heading className="font-display text-lg text-gray-800 mb-4">Pre-booking Information</Heading>
                {getPreBookingQnA({ booking }).map((qa, index) => (
                  <div key={index} className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">{qa.question}</Text>
                    <Text className="text-sm text-gray-800 bg-white p-3 rounded border-l-4 border-blue-400">
                      {qa.answer}
                    </Text>
                  </div>
                ))}
              </Section>
            )}

            <Section className="text-center mb-6">
              <Button
                href={`https://positivemindcare.com/dashboard/bookings/${booking.id}`}
                className="bg-emerald-500 text-white py-3 px-8 rounded-lg text-base font-semibold no-underline mr-4"
              >
                View Booking Details
              </Button>
              <Button
                href={`https://positivemindcare.com/dashboard/calendar`}
                className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg text-base font-semibold no-underline"
              >
                Open Calendar
              </Button>
            </Section>

            <Text className="text-base text-gray-600 mb-4">
              Please prepare for your session and ensure you're available at the scheduled time. If you need to
              reschedule or cancel, please do so at least 24 hours in advance.
            </Text>

            <Text className="text-base">
              Best regards,
              <br />
              <span className="text-emerald-500 font-semibold">Positive Mind Care</span>
            </Text>
          </Section>
        </Container>
      </Html>
    </Tailwind>
  )
}
