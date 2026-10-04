import { config } from '../config'
import { createLogger } from './logger'

const logger = createLogger('sms')

export async function sendOTPMessage({ to, otp }: { to: string; otp: string }) {
  try {
    const dest = toIndianMobileNumber(to)
    const params = new URLSearchParams({
      uname: config.sms.uname,
      pass: config.sms.pass,
      send: config.sms.senderId,
      dest,
      msg: OTP_TEMPLATE.replace('{otp}', otp),
    })
    const response = await fetch(
      `${config.sms.apiBaseUrl}/BulkSMSapi/keyApiSendSMS/SendMsg?${params.toString()}`,
    )

    const result = await response.json()
    logger.info({ result, ok: response.ok }, `SMS provider response for OTP to ${to}`)
    if (!result?.isSuccess) {
      logger.error({ result }, `SMS provider rejected OTP for ${to}`)
    }
    return result
  } catch (error) {
    logger.error({ error }, `Failed to send OTP SMS to ${to}`)
    return null
  }
}

// The provider expects a plain 10-digit mobile number, not E.164 (e.g. "+919999999999").
function toIndianMobileNumber(phoneNumber: string) {
  const digitsOnly = phoneNumber.replace(/\D/g, '')
  return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly
}

// Do not change the template as it is pre-approved by the SMS provider
const OTP_TEMPLATE = `Dear customer, your OTP for registration is {otp} Use this OTP to validate your login.
PSTVMC`
