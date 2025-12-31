import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { render } from '@react-email/render'
import { config } from '../config'
import { getErrorMessage } from './utils'
import { createLogger } from './logger'


import TrialSessionEmail from '../emails/trial-session-email'
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
  const subject = 'Your Trial Session is Booked'

  try {
    
    const htmlContent = await render(
      TrialSessionEmail({ input }),
    )

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
            Body: {
              Html: { Data: htmlContent },
            },
          },
        },
      }),
    )

    logger.info(`Trial session email sent successfully: ${to}`)
  } catch (error) {
    logger.error(
      `Failed to send trial session email: ${getErrorMessage(error)} [email=${to}]`,
    )
  }
}
