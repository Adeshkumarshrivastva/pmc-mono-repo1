import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { Resource } from 'sst'
import { phoneNumber, role } from 'better-auth/plugins'
import { prisma } from './db'
import { config } from '../config'
import { invariant } from './utils'

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
      sendOTP: ({ phoneNumber, code }) => {
        console.log(`Sending OTP code ${code} to phone number ${phoneNumber}`)
        // TODO: Implement sending OTP code via SMS
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
        type: 'string',
        required: true,
      },
    },
  },
})
