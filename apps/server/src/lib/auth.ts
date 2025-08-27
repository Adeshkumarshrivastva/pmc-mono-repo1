import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { Resource } from 'sst'
import { phoneNumber } from 'better-auth/plugins'
import { prisma } from './db'

const isDevelopment = Resource.App.stage !== 'production'

export const auth = betterAuth({
  basePath: '/server/auth',
  secret: Resource.BETTER_AUTH_SECRET.value,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  trustedOrigins: ['http://localhost:5173'],
  socialProviders: {
    google: {
      clientId: Resource.GOOGLE_CLIENT_ID.value,
      clientSecret: Resource.GOOGLE_CLIENT_SECRET.value,
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
