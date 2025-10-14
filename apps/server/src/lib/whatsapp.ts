import { Resource } from 'sst'
import { config } from '../config'

type WhatsappTemplatePayload = {
  to: string
  templateName: string
  templateValues: (string | number)[]
  urlParams?: (string | number)[]
  buttonParams?: (string | number)[]
}

const isDevelopment = Resource.App.stage !== 'production'

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

    await response.json()
  } catch {
    return null
  }
}
