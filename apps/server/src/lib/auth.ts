import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { Resource } from 'sst'
import { phoneNumber } from 'better-auth/plugins'
import { prisma } from './db'
import { config } from '../config'
import { invariant } from './utils'
import { sendWhatsappMessageByTemplate } from './whatsapp'

invariant(config, 'config should be present')

const isDevelopment = Resource.App.stage !== 'production'

export const auth = betterAuth({
  basePath: '/server/auth',
  secret: config.databaseUrl,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  trustedOrigins: [config.cors.origin],
  socialProviders: {
    google: {
      clientId: config.auth.google.clientId,
      clientSecret: config.auth.google.clientSecret,
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        if (isDevelopment) {
          console.log(`Sending OTP code ${code} to phone number ${phoneNumber}`)
        } else {
          await sendWhatsappMessageByTemplate({
            to: phoneNumber,
            templateName: 'new_otp_verification',
            templateValues: [code],
            urlParams: [code],
          })
          // TODO: Implement sending OTP code via SMS
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
})
