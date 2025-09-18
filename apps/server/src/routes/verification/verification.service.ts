import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie } from 'hono/cookie'
import z from 'zod'
import { BetterAuthError } from 'better-auth'
import type { InitiatePatientAuthInput, VerifyPatientInput } from './verification.input'
import type { C } from '../../lib/context'
import { getErrorMessage, MINUTE } from '../../lib/utils'
import { env } from '../../lib/env'
import { auth } from '../../lib/auth'

export async function initiatePatientAuth(c: C, input: InitiatePatientAuthInput) {
  try {
    await auth.api.sendPhoneNumberOTP({ body: { phoneNumber: input.phoneNumber }, asResponse: true })
    const jwtToken = await sign({ phoneNumber: input.phoneNumber }, env.JWT_SECRET)
    setCookie(c, 'OTP_VERIFICATION_COOKIE', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: env.NODE_ENV === 'production' ? 'Lax' : 'None',
      maxAge: 10 * MINUTE,
    })
    return c.json({ success: true, phoneNumber: input.phoneNumber })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to send OTP : ${errorMessage}` }, 500)
  }
}

export async function verifyPatientAuth(c: C, input: VerifyPatientInput) {
  const jwtToken = getCookie(c, 'OTP_VERIFICATION_COOKIE')
  if (!jwtToken) {
    return c.json({ error: 'Missing JWT token' }, 400)
  }

  const parseResult = z.object({ phoneNumber: z.string() }).safeParse(await verify(jwtToken, env.JWT_SECRET))
  if (!parseResult.success) {
    return c.json({ error: 'Missing JWT token' }, 400)
  }

  try {
    const { headers } = await auth.api.verifyPhoneNumber({
      body: {
        phoneNumber: parseResult.data.phoneNumber,
        code: input.otp,
      },
      returnHeaders: true,
    })
    headers.forEach((value, key) => {
      c.header(key, value)
    })
    return c.json({ success: true })
  } catch (error) {
    if (error instanceof BetterAuthError) {
      return c.json({ error: 'Patient not found' }, 404)
    }
    const errorMessage = getErrorMessage(error)
    return c.json({ error: errorMessage }, 500)
  }
}
