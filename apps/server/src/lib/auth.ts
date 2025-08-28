import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { Resource } from 'sst'
import { phoneNumber } from 'better-auth/plugins'
import { prisma } from './db'
import { env } from './env'

const isDevelopment = Resource.App.stage !== 'production'

export const auth = betterAuth({
  basePath: '/server/auth',
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  trustedOrigins: ['http://localhost:5173'],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => {
        console.log(`Sending OTP code ${code} to phone number ${phoneNumber}`)
        // Implement sending OTP code via SMS
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
