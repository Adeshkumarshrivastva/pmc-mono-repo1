/** @jsxImportSource react */

import {
  Container,
  Font,
  Html,
  Heading,
  Img,
  Text,
  Section,
  Row,
  Column,
  Button,
  Tailwind,
} from '@react-email/components'
import { type Booking, type Expert, type Service, type Patient, ServiceMode } from '../generated/prisma'

type BookingWithRelations = Booking & {
  expert: Expert & {
    user: {
      name: string | null
      email: string
    }
  }
  patient: Patient & {
    user: {
      name: string | null
      email: string | null
    }
  }
  service: Service
}

type InPersonLocation = {
  address?: string
  city?: string
}

type VirtualLocation = {
  meetingLink?: string
}

type PreBookingQnA = {
  question: string
  answer: string
}

type BookingConfirmationProps = {
  booking: BookingWithRelations
}

export default function BookingConfirmationForPatient({ booking }: BookingConfirmationProps) {
  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

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
        <Container style={{ backgroundColor: 'var(--color-background)', maxWidth: '672px', margin: '0 auto' }}>
          <Section
            style={{
              backgroundColor: 'var(--color-primary)',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--color-primary-foreground)',
            }}
          >
            <Heading
              style={{
                fontFamily: '"Figtree", sans-serif',
                fontSize: '24px',
                margin: '0',
                color: 'var(--color-primary-foreground)',
              }}
            >
              Booking Confirmed!
            </Heading>
            <Text
              style={{
                fontSize: '18px',
                opacity: '0.9',
                margin: '8px 0 0 0',
                color: 'var(--color-primary-foreground)',
              }}
            >
              Your appointment has been successfully booked
            </Text>
          </Section>

          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '18px', marginBottom: '24px' }}>
              Hi {booking.patientName || booking.patient.user.name},
            </Text>

            <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
              Your appointment for <strong>{booking.serviceName}</strong> has been confirmed with Dr.{' '}
              {booking.expert.user.name}. Here are your booking details:
            </Text>

            <Section
              style={{
                backgroundColor: 'var(--color-muted)',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <Heading
                style={{
                  fontFamily: '"Figtree", sans-serif',
                  fontSize: '20px',
                  color: 'var(--color-foreground)',
                  marginBottom: '16px',
                }}
              >
                Appointment Details
              </Heading>

              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '33.33%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-muted-foreground)',
                      fontWeight: '600',
                      margin: '0',
                    }}
                  >
                    Service:
                  </Text>
                </Column>
                <Column style={{ width: '66.67%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-foreground)',
                      margin: '0',
                    }}
                  >
                    {booking.serviceName}
                  </Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '33.33%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-muted-foreground)',
                      fontWeight: '600',
                      margin: '0',
                    }}
                  >
                    Doctor:
                  </Text>
                </Column>
                <Column style={{ width: '66.67%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-foreground)',
                      margin: '0',
                    }}
                  >
                    Dr. {booking.expert.user.name}
                  </Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '33.33%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-muted-foreground)',
                      fontWeight: '600',
                      margin: '0',
                    }}
                  >
                    Date & Time:
                  </Text>
                </Column>
                <Column style={{ width: '66.67%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-foreground)',
                      margin: '0',
                      fontWeight: '600',
                    }}
                  >
                    {formatDateTime(booking.startDateTime.toISOString())}
                  </Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '33.33%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-muted-foreground)',
                      fontWeight: '600',
                      margin: '0',
                    }}
                  >
                    Duration:
                  </Text>
                </Column>
                <Column style={{ width: '66.67%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-foreground)',
                      margin: '0',
                    }}
                  >
                    {booking.serviceDurationInMinutes} minutes
                  </Text>
                </Column>
              </Row>

              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '33.33%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-muted-foreground)',
                      fontWeight: '600',
                      margin: '0',
                    }}
                  >
                    Mode:
                  </Text>
                </Column>
                <Column style={{ width: '66.67%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-foreground)',
                      margin: '0',
                    }}
                  >
                    {booking.mode === ServiceMode.VIRTUAL ? 'Virtual Session' : 'In-Person'}
                  </Text>
                </Column>
              </Row>

              {booking.mode === ServiceMode.IN_PERSON && booking.inPersonLocation && (
                <Row style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '33.33%' }}>
                    <Text
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-muted-foreground)',
                        fontWeight: '600',
                        margin: '0',
                      }}
                    >
                      Location:
                    </Text>
                  </Column>
                  <Column style={{ width: '66.67%' }}>
                    <Text
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-foreground)',
                        margin: '0',
                      }}
                    >
                      {(booking.inPersonLocation as InPersonLocation)?.address},{' '}
                      {(booking.inPersonLocation as InPersonLocation)?.city}
                    </Text>
                  </Column>
                </Row>
              )}

              {booking.mode === ServiceMode.VIRTUAL && booking.virtualLocation && (
                <Row style={{ marginBottom: '12px' }}>
                  <Column style={{ width: '33.33%' }}>
                    <Text
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-muted-foreground)',
                        fontWeight: '600',
                        margin: '0',
                      }}
                    >
                      Meeting Link:
                    </Text>
                  </Column>
                  <Column style={{ width: '66.67%' }}>
                    <Button
                      href={(booking.virtualLocation as VirtualLocation)?.meetingLink}
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-primary-foreground)',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      Join Meeting
                    </Button>
                  </Column>
                </Row>
              )}

              <Row style={{ marginBottom: '12px' }}>
                <Column style={{ width: '33.33%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-muted-foreground)',
                      fontWeight: '600',
                      margin: '0',
                    }}
                  >
                    Total Fee:
                  </Text>
                </Column>
                <Column style={{ width: '66.67%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-foreground)',
                      margin: '0',
                      fontWeight: '600',
                    }}
                  >
                    {formatCurrency(booking.servicePrice, booking.serviceCurrency)}
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column style={{ width: '33.33%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-muted-foreground)',
                      fontWeight: '600',
                      margin: '0',
                    }}
                  >
                    Booking ID:
                  </Text>
                </Column>
                <Column style={{ width: '66.67%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-foreground)',
                      margin: '0',
                      fontFamily: 'monospace',
                    }}
                  >
                    #{booking.id.slice(-8).toUpperCase()}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section
              style={{
                backgroundColor: 'var(--color-accent)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <Heading
                style={{
                  fontFamily: '"Figtree", sans-serif',
                  fontSize: '18px',
                  color: 'var(--color-foreground)',
                  marginBottom: '12px',
                }}
              >
                Important Instructions
              </Heading>
              <Text
                style={{
                  fontSize: '14px',
                  color: 'var(--color-foreground)',
                  marginBottom: '8px',
                  lineHeight: '1.5',
                }}
              >
                • Please arrive 10 minutes early for in-person appointments
              </Text>
              <Text
                style={{
                  fontSize: '14px',
                  color: 'var(--color-foreground)',
                  marginBottom: '8px',
                  lineHeight: '1.5',
                }}
              >
                • Test your internet connection before virtual sessions
              </Text>
              <Text
                style={{
                  fontSize: '14px',
                  color: 'var(--color-foreground)',
                  marginBottom: '8px',
                  lineHeight: '1.5',
                }}
              >
                • Bring a valid ID and any relevant medical documents
              </Text>
              <Text
                style={{
                  fontSize: '14px',
                  color: 'var(--color-foreground)',
                  lineHeight: '1.5',
                }}
              >
                • Cancel or reschedule at least 24 hours in advance to avoid charges
              </Text>
            </Section>

            {booking.preBookingQnA && (
              <Section
                style={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                <Heading
                  style={{
                    fontFamily: '"Figtree", sans-serif',
                    fontSize: '18px',
                    color: 'var(--color-foreground)',
                    marginBottom: '16px',
                  }}
                >
                  Your Pre-booking Information
                </Heading>
                {Array.isArray(booking.preBookingQnA) &&
                  (booking.preBookingQnA as PreBookingQnA[]).map((qa: PreBookingQnA, index: number) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                      <Text
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--color-foreground)',
                          marginBottom: '4px',
                        }}
                      >
                        {qa.question}
                      </Text>
                      <Text
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-muted-foreground)',
                          backgroundColor: 'var(--color-muted)',
                          padding: '12px',
                          borderRadius: '4px',
                          borderLeft: '4px solid var(--color-accent-foreground)',
                          fontStyle: 'italic',
                        }}
                      >
                        "{qa.answer}"
                      </Text>
                    </div>
                  ))}
              </Section>
            )}

            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Button
                href={`https://positivemindcare.com/bookings/${booking.id}`}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground)',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  marginRight: '16px',
                  marginBottom: '8px',
                  display: 'inline-block',
                }}
              >
                View Booking Details
              </Button>
              <Button
                href={`https://positivemindcare.com/bookings/${booking.id}/reschedule`}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-secondary-foreground)',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  marginBottom: '8px',
                  display: 'inline-block',
                }}
              >
                Reschedule Appointment
              </Button>
            </Section>

            <Text
              style={{
                fontSize: '16px',
                color: 'var(--color-muted-foreground)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              We're looking forward to helping you on your journey to better mental health.
            </Text>

            <Text style={{ fontSize: '16px', textAlign: 'center' }}>
              Warm regards,
              <br />
              <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Positive Mind Care Team</span>
            </Text>
          </Section>

          <Section style={{ backgroundColor: 'var(--color-muted)', padding: '24px', textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: 'var(--color-muted-foreground)', marginBottom: '8px' }}>
              Need help or have questions?
            </Text>
            <Text style={{ fontSize: '14px', color: 'var(--color-muted-foreground)' }}>
              Contact us at{' '}
              <a href="tel:+918920530832" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                +91 89205 30832
              </a>
            </Text>
          </Section>
        </Container>
      </Html>
    </Tailwind>
  )
}
