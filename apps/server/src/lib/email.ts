import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import dayjs from './dayjs'
import { config } from '../config'
import { getErrorMessage } from './utils'
import { createLogger } from './logger'

import type { SendTrialSessionEmailInput } from '../routes/patient/patient.input'

const sesClient = new SESv2Client()
const logger = createLogger('trial-session-email')

export async function sendTrialSessionEmail({
  to,
  cc,
  input,
}: {
  to: string
  cc: string[]
  input: SendTrialSessionEmailInput
}) {
  const { name, phoneNumber, date } = input

  const formattedDate = dayjs(date).format('DD MMM YYYY, hh:mm A')

  const subject = 'Your Trial Session is Booked'

  const htmlContent = `
    <p>Hi ${name},</p>

    <p>Your trial session has been successfully scheduled.</p>

    <p>
      <strong>Date & Time:</strong> ${formattedDate}<br />
      <strong>Phone:</strong> ${phoneNumber}
    </p>

    <p>
      Our team will contact you shortly with further details.
    </p>

    <p>
      Thanks & regards,<br />
      Team
    </p>
  `

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

    logger.info(`Trial session email sent successfully: ${to}`)
  } catch (error) {
    logger.error(`Failed to send trial session email: ${getErrorMessage(error)} [email=${to}]`)
  }
}
