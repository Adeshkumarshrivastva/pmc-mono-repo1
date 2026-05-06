import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { phoneNumber } from 'better-auth/plugins'
import { prisma } from './db'
import { config } from '../config'
import { invariant } from './utils'
import { sendWhatsappMessageByTemplate } from './whatsapp'
import { rootLogger } from './logger'
import { sendOTPMessage } from './sms'

invariant(config, 'config should be present')

const isDevelopment = process.env.NODE_ENV !== 'production'

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
        rootLogger.info(`node env: ${process.env.NODE_ENV}`)
        if (!isDevelopment) {
          await sendOTPMessage({ to: phoneNumber, otp: code })

          await sendWhatsappMessageByTemplate({
            to: phoneNumber,
            templateName: 'verify_user_otp',
            templateValues: [code],
            urlParams: [code],
          })
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
      sameSite: isDevelopment ? 'None' : 'Lax',
      secure: true,
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
