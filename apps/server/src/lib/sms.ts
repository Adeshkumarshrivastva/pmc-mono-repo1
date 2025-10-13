import { config } from '../config'

export async function sendOTPMessage({ to, otp }: { to: string; otp: string }) {
  try {
    const params = new URLSearchParams({
      uname: config.sms.userId,
      pass: config.sms.password,
      send: 'PSTVMC',
      dest: to,
      msg: OTP_TEMPLATE.replace('{otp}', otp),
      priority: '1',
    })
    const response = await fetch(`http://164.52.195.161/API/SendMsg.aspx?${params.toString()}`)

    await response.json()
  } catch {
    return null
  }
}

// Do not change the template as it is pre-approved by the SMS provider
const OTP_TEMPLATE = `Dear customer, your OTP for registration is {otp} Use this OTP to validate your login.
PSTVMC`
