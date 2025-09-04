import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie } from 'hono/cookie'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import type { GetPatientByMobileNumberInput, VerifyPatientInput } from './booking.input'
import { getErrorMessage, MINUTE } from '../../lib/utils'
import { sendOtp, verifyOtp } from '../otp/otp.service'
import { env } from '../../lib/env'

export async function getPatientByMobileNumber(c: C, input: GetPatientByMobileNumberInput) {
  try {
    const { id, mobileNumber } = await sendOtp({ mobileNumber: input.mobileNumber })
    const jwtToken = await sign({ otpId: id, mobileNumber }, env.JWT_SECRET)
    setCookie(c, 'OTP_VERIFICATION_COOKIE', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 10 * MINUTE,
    })

    return c.json({ success: true })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to send OTP : ${errorMessage}` }, 500)
  }
}

export async function verifyPatient(c: C, input: VerifyPatientInput) {
  const jwtToken = getCookie(c, 'OTP_VERIFICATION_COOKIE')
  if (!jwtToken) {
    throw new Error('Missing verification cookie')
  }

  const { otpId, mobileNumber } = await verify(jwtToken, env.JWT_SECRET)
  if (!otpId || typeof otpId !== 'string') {
    throw new Error('OTP ID must be present.')
  }

  const { success: isOtpVerified } = await verifyOtp({ otp: input.otp, otpId: otpId })
  if (!isOtpVerified) {
    return c.json({ error: 'OTP verification failed' }, 500)
  }

  if (!mobileNumber || typeof mobileNumber !== 'string') {
    throw new Error('OTP ID must be present.')
  }
  const user = await prisma.user.findUnique({
    where: {
      phoneNumber: mobileNumber,
      role: 'PATIENT',
    },
  })
  if (!user) {
    return c.json({ error: 'Patient not found' }, 404)
  }

  return c.json({ user })
}
