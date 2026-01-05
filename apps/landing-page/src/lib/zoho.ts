import { env } from '@/env'
import * as z from 'zod'

function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`
  }

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`
  }

  if (phone.startsWith('+91')) {
    return phone
  }

  return phone
}

class ZohoAPI {
  #clientId: string
  #clientSecret: string
  #refreshToken: string

  constructor() {
    this.#clientId = env.ZOHO_CLIENT_ID
    this.#clientSecret = env.ZOHO_CLIENT_SECRET
    this.#refreshToken = env.ZOHO_REFRESH_TOKEN
  }

  async #getAccessToken() {
    const form = new FormData()
    form.append('grant_type', 'refresh_token')
    form.append('client_id', this.#clientId)
    form.append('client_secret', this.#clientSecret)
    form.append('refresh_token', this.#refreshToken)

    const response = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      body: form,
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }
    const { access_token } = z.object({ access_token: z.string() }).parse(await response.json())
    return access_token
  }

  async createLead(leadData: {
    lastName: string
    firstName: string
    email?: string
    phone: string
    leadSource?: string
    dateAndTime?: string
    description?: string
    service?: string
    subService?: string
    quizName?: string
    quizAnswers?: string
  }) {
    const accessToken = await this.#getAccessToken()
    const response = await fetch('https://www.zohoapis.in/crm/v8/Leads', {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      body: JSON.stringify({
        data: [
          {
            Last_Name: leadData.lastName,
            First_Name: leadData.firstName,
            Email: leadData.email,
            Phone: formatPhoneNumber(leadData.phone),
            Lead_Source: leadData.leadSource,
            Date_And_Time: leadData.dateAndTime,
            Description: leadData.description,
            Service: leadData.service,
            Sub_Service: leadData.subService,
            Quiz_Name: leadData.quizName,
            Quiz_Answers: leadData.quizAnswers,
          },
        ],
      }),
    })

    const data = await response.json()
    return data
  }
}

export const zohoAPI = new ZohoAPI()
