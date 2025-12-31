/** @jsxImportSource react */

import { Container, Font, Html, Heading, Text, Section, Row, Column, Tailwind } from '@react-email/components'
import dayjs from '../lib/dayjs'
import type { SendTrialSessionEmailInput } from '../routes/patient/patient.input'

type TrialSessionEmailProps = {
  input: SendTrialSessionEmailInput
}

export default function TrialSessionEmail({ input }: TrialSessionEmailProps) {
  const { name, phoneNumber, date } = input
  const formattedDate = dayjs(date).format('DD MMM YYYY, hh:mm A')

  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            fontFamily: {
              display: ['"Barlow"', 'sans-serif'],
              sans: ['"Figtree"', 'sans-serif'],
            },
          },
        },
      }}
    >
      <Html className="font-sans">
        <Font fontFamily="Figtree" fallbackFontFamily="sans-serif" />
        <Font fontFamily="Barlow" fallbackFontFamily="sans-serif" />

        <Container className="bg-white max-w-2xl mx-auto">
          <Section className="bg-emerald-500 p-8 text-center text-white">
            <Heading className="font-display text-2xl m-0 text-white">Trial Session Confirmed</Heading>
            <Text className="text-lg opacity-90 mb-0 text-white">Your trial session has been scheduled</Text>
          </Section>

          <Section className="p-8">
            <Text className="text-lg mb-6">Hi {name},</Text>

            <Text className="text-base mb-6">
              Thank you for booking a trial session with us. Below are the details:
            </Text>

            <Section className="bg-gray-50 rounded-lg p-6 mb-6">
              <Heading className="font-sans text-xl text-gray-900 mb-4">Trial Session Details</Heading>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Date & Time:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{formattedDate}</Text>
                </Column>
              </Row>

              <Row className="mb-3">
                <Column className="w-1/3">
                  <Text className="text-sm text-gray-600 font-semibold m-0">Phone:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm text-gray-900 m-0">{phoneNumber}</Text>
                </Column>
              </Row>
            </Section>

            <Text className="text-base text-gray-600 mb-4">
              Our team will contact you shortly with further details.
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
