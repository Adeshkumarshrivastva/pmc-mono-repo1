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

type BookingConfirmationProps = {
  booking: BookingWithRelations
}

export default function BookingConfirmationForExpert({ booking }: BookingConfirmationProps) {
  function formatDateTime(dateTime: string) {
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

  function formatCurrency(amount: number, currency: string) {
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
        <Container style={{ backgroundColor: '#ffffff', maxWidth: '672px', margin: '0 auto' }}>
          <Section style={{ backgroundColor: '#10b981', padding: '32px', textAlign: 'center', color: '#ffffff' }}>
            <Heading
              style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: '24px',
                margin: '0',
                color: '#ffffff',
              }}
            >
              New Booking Confirmation
            </Heading>
            <Text
              style={{
                fontSize: '18px',
                opacity: '0.9',
                margin: '8px 0 0 0',
                color: '#ffffff',
              }}
            >
              You have a new appointment scheduled
            </Text>
          </Section>

          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '18px', marginBottom: '24px' }}>
              Hi Dr. {booking.expert.user.name || 'Doctor'},
            </Text>

            <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
              You have a new booking for <strong>{booking.serviceName}</strong>. Here are the details:
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
                    Patient:
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
                    {booking.patientName}
                  </Text>
                </Column>
              </Row>

              {booking.patientEmail || booking.patient.user.email ? (
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
                      Email:
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
                      {booking.patientEmail || booking.patient.user.email}
                    </Text>
                  </Column>
                </Row>
              ) : null}

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
                    Date & Time:
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
                        padding: '8px 16px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '14px',
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
                    Fee:
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
                    }}
                  >
                    #{booking.id.slice(-8).toUpperCase()}
                  </Text>
                </Column>
              </Row>
            </Section>

            {booking.preBookingQnA && (
              <Section
                style={{
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <Heading
                  style={{
                    fontFamily: '"Bricolage Grotesque", sans-serif',
                    fontSize: '18px',
                    color: '#1f2937',
                    marginBottom: '16px',
                  }}
                >
                  Pre-booking Information
                </Heading>
                {Array.isArray(booking.preBookingQnA) &&
                  (booking.preBookingQnA as any[]).map((qa: any, index: number) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                      <Text
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '4px',
                        }}
                      >
                        {qa.question}
                      </Text>
                      <Text
                        style={{
                          fontSize: '14px',
                          color: '#1f2937',
                          backgroundColor: '#ffffff',
                          padding: '12px',
                          borderRadius: '4px',
                          borderLeft: '4px solid #60a5fa',
                        }}
                      >
                        {qa.answer}
                      </Text>
                    </div>
                  ))}
              </Section>
            )}

            <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Button
                href={`https://positivemindcare.com/dashboard/bookings/${booking.id}`}
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  marginRight: '16px',
                }}
              >
                View Booking Details
              </Button>
              <Button
                href={`https://positivemindcare.com/dashboard/calendar`}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#1f2937',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                Open Calendar
              </Button>
            </Section>

            <Text style={{ fontSize: '16px', color: '#4b5563', marginBottom: '16px' }}>
              Please prepare for your session and ensure you're available at the scheduled time. If you need to
              reschedule or cancel, please do so at least 24 hours in advance.
            </Text>

            <Text style={{ fontSize: '16px' }}>
              Best regards,
              <br />
              <span style={{ color: '#10b981', fontWeight: '600' }}>Positive Mind Care</span>
            </Text>
          </Section>
        </Container>
      </Html>
    </Tailwind>
  )
}
