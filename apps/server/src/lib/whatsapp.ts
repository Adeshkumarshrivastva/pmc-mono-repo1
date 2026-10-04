import { config } from '../config'
import { createLogger } from './logger'

const logger = createLogger('whatsapp')

type WhatsappTemplatePayload = {
  to: string
  templateName: string
  templateValues: (string | number)[]
  urlParams?: (string | number)[]
  buttonParams?: (string | number)[]
}

const isDevelopment = process.env.NODE_ENV !== 'production'

export async function sendWhatsappMessageByTemplate({
  to,
  templateName,
  templateValues,
  urlParams = [],
  buttonParams = [],
}: WhatsappTemplatePayload) {
  try {
    const params = new URLSearchParams({
      LicenseNumber: config.whatsapp.licenceNumber,
      APIKey: config.whatsapp.apiKey,
      Contact: isDevelopment ? config.whatsapp.testNumber : to,
      Template: templateName,
      Param: templateValues.join(','),
      URLParam: urlParams.join(','),
      Button: buttonParams.join(','),
    })
    const response = await fetch(`https://app.chatboat.in/api/sendtemplate.php?${params.toString()}`)

    const result = await response.json()
    // Chatboat's success/failure shape isn't documented here, so log the raw
    // result unconditionally rather than guess at a field name and risk
    // silently swallowing a real rejection the way this used to (see the
    // catch block below, and sms.ts's equivalent `isSuccess` check).
    logger.info({ result, ok: response.ok }, `WhatsApp template "${templateName}" sent to ${to}`)
    return result
  } catch (error) {
    logger.error({ error }, `Failed to send WhatsApp template "${templateName}" to ${to}`)
    return null
  }
}
