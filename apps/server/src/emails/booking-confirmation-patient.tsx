/** @jsxImportSource react */

import { Container, Font, Html, Heading, Text, Section, Row, Column, Button, Tailwind } from '@react-email/components'
import { match } from 'ts-pattern'
import { type Booking, type Expert, type Service, type Patient, type User, ServiceMode } from '../generated/prisma'
import { formatCurrency } from '../lib/booking'
import { formatDateTimeRange } from '../lib/date'
import { getInPersonLocation, getVirtualMeetLink } from '../lib/location'

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
  orderId: string
}

export default function BookingConfirmationForPatient({ booking, orderId }: BookingConfirmationProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            fontFamily: {
              display: ['"Figtree"', 'sans-serif'],
              sans: ['"Figtree"', 'sans-serif'],
            },
          },
        },
      }}
    >
      <Html className="font-sans">
        <Font
          fontFamily="Figtree"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap',
            format: 'woff2',
          }}
        />
        <Container className="bg-white max-w-2xl mx-auto">
          <Section className="bg-blue-600 p-8 text-center text-white">
            <Heading className="font-display text-2xl m-0 text-white">Booking Confirmed!</Heading>
            <Text className="text-lg opacity-90 mt-2 mb-0 text-white">
              Your appointment has been successfully booked
            </Text>
          </Section>

          <Section className="p-8">
            <Text className="text-lg mb-6">Hi {booking.patientName || booking.patient.user.name},</Text>

            <Text className="text-base mb-6">
              Your appointment for <strong>{booking.serviceName}</strong> has been confirmed with{' '}
              {booking.expert.user.name}. Here are your booking details:
            </Text>

            <Section className="bg-gray-50 rounded-lg p-6 mb-6">
              <Heading className="font-sans text-xl text-gray-900 mb-4">Appointment Details</Heading>

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
                  <Text className="text-sm text-gray-600 font-semibold m-0">Doctor:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0"> {booking.expert.user.name}</Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Date & Time:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">
                    {formatDateTimeRange({ startDateTime: booking.startDateTime, endDateTime: booking.endDateTime })}
                  </Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Duration:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{booking.serviceDurationInMinutes} minutes</Text>
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

              {match(booking.mode)
                .with(ServiceMode.IN_PERSON, () => (
                  <Row className="mb-3">
                    <Column className="w-1/3">
                      <Text className="text-sm text-gray-600 font-semibold m-0">Location:</Text>
                    </Column>
                    <Column className="w-2/3">
                      <Text className="text-sm text-gray-900 m-0">{getInPersonLocation(booking.inPersonLocation)}</Text>
                    </Column>
                  </Row>
                ))
                .with(ServiceMode.VIRTUAL, () => (
                  <Row className="mb-3">
                    <Column className="w-1/3">
                      <Text className="text-sm text-gray-600 font-semibold m-0">Meeting Link:</Text>
                    </Column>
                    <Column className="w-2/3">
                      <Button
                        href={getVirtualMeetLink(booking.virtualLocation)}
                        className="bg-blue-600 text-white py-2 px-5 rounded text-sm no-underline font-semibold"
                      >
                        Join Meeting
                      </Button>
                    </Column>
                  </Row>
                ))
                .otherwise(() => null)}

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Total Fee:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0 font-semibold">
                    {formatCurrency(booking.servicePrice, booking.serviceCurrency)}
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Order ID:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">#{orderId}</Text>
                </Column>
              </Row>
            </Section>

            <Section className="bg-yellow-50 rounded-lg p-5 mb-6">
              <Heading className="font-sans text-lg text-gray-900 mb-3">Important Instructions</Heading>
              <Text className="text-sm text-gray-800 mb-2 leading-relaxed">
                • Please arrive 10 minutes early for in-person appointments
              </Text>
              <Text className="text-sm text-gray-800 mb-2 leading-relaxed">
                • Test your internet connection before virtual sessions
              </Text>
              <Text className="text-sm text-gray-800 mb-2 leading-relaxed">
                • Bring a valid ID and any relevant medical documents
              </Text>
              <Text className="text-sm text-gray-800 leading-relaxed">
                • Cancel or reschedule at least 24 hours in advance to avoid charges
              </Text>
            </Section>

            <Section className="text-center mb-8">
              <Button
                href={`https://positivemindcare.com/portal/bookings/${booking.id}`}
                className="bg-blue-600 text-white py-3.5 px-8 rounded-lg text-base font-semibold no-underline mr-4 mb-2 inline-block"
              >
                View Booking Details
              </Button>
            </Section>

            <Text className="text-base text-gray-600 mb-4 text-center">
              We're looking forward to helping you on your journey to better mental health.
            </Text>

            <Text className="text-base text-center">
              Warm regards,
              <br />
              <span className="text-blue-600 font-semibold">Positive Mind Care Team</span>
            </Text>
          </Section>

          <Section className="bg-gray-100 p-6 text-center">
            <Text className="text-sm text-gray-600 mb-2">Need help or have questions?</Text>
            <Text className="text-sm text-gray-600">
              Contact us at{' '}
              <a href="tel:+918920530832" className="text-blue-600 no-underline">
                +91 89205 30832
              </a>
            </Text>
          </Section>
        </Container>
      </Html>
    </Tailwind>
  )
}
