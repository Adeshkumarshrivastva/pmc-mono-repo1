import { env } from '../env'

type WhatsappTemplatePayload = {
  to: string
  templateName: string
  templateValues: (string | number)[]
  urlParams?: (string | number)[]
  buttonParams?: (string | number)[]
}

export async function sendWhatsappMessageByTemplate({
  to,
  templateName,
  templateValues,
  urlParams = [],
  buttonParams = [],
}: WhatsappTemplatePayload) {
  try {
    const params = new URLSearchParams({
      LicenseNumber: env.WHATSAPP_LICENCE_NUMBER_SECRET,
      APIKey: env.WHATSAPP_API_KEY_SECRET,
      Contact: to,
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
