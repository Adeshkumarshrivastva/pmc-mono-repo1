import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { phoneNumber } from 'better-auth/plugins'
import { prisma } from './db'
import { config } from '../config'
import { invariant } from './utils'
import { sendWhatsappMessageByTemplate } from './whatsapp'
import { rootLogger } from './logger'
import { sendOTPMessage } from './sms'
import { env } from './env'

invariant(config, 'config should be present')

const isDevelopment = process.env.NODE_ENV !== 'production'
// See env.ts — lets a dev server send real OTP SMS/WhatsApp for on-device
// testing without flipping NODE_ENV (which also changes cookie behavior).
const forceRealOtpSms = env.FORCE_REAL_OTP_SMS === 'true'

export const auth = betterAuth({
  basePath: '/server/auth',
  secret: config.databaseUrl,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  trustedOrigins: config.cors.origin,
  socialProviders: {
    google: {
      clientId: config.auth.google.clientId,
      clientSecret: config.auth.google.clientSecret,
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        if (!isDevelopment || forceRealOtpSms) {
          await sendOTPMessage({ to: phoneNumber, otp: code })

          await sendWhatsappMessageByTemplate({
            to: phoneNumber,
            templateName: 'verify_user_otp',
            templateValues: [code],
            urlParams: [code],
          })
          rootLogger.info(`Sent real OTP SMS/WhatsApp (code ${code}) to phone number ${phoneNumber}`)
        } else {
          rootLogger.info(`Sending OTP code ${code} to phone number ${phoneNumber}`)
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@pmc.com`
        },
      },
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      // SameSite=None requires Secure=true; browsers silently reject None+non-Secure.
      // localhost ports are same-site, so Lax works fine in dev.
      // Production keeps None+Secure for cross-domain deployments.
      sameSite: isDevelopment ? 'Lax' : 'None',
      secure: !isDevelopment,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ['EXPERT', 'PATIENT', 'ADMIN'],
        input: false,
      },
    },
  },
})
