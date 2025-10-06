import { config } from '../config'

type WhatsappTemplatePayload = {
  to: string
  templateName: string
  templateValues: (string | number)[]
  urlParams?: (string | number)[]
}

export async function sendWhatsappMessageByTemplate({
  to,
  templateName,
  templateValues,
  urlParams = [],
}: WhatsappTemplatePayload) {
  try {
    const params = new URLSearchParams({
      LicenseNumber: config.whatsapp.licenceNumber,
      APIKey: config.whatsapp.apiKey,
      Contact: `91${to}`,
      Template: templateName,
      Param: templateValues.join(','),
      URLParam: urlParams.join(','),
    })
    const response = await fetch(`https://app.chatboat.in/api/sendtemplate.php?${params.toString()}`)

    await response.json()
  } catch {
    return null
  }
}
