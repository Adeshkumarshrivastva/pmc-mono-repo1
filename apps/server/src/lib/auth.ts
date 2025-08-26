import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { Resource } from 'sst'
import { phoneNumber } from 'better-auth/plugins'
import { prisma } from './db'

const isDevelopment = process.env.NODE_ENV !== 'production'
console.log('is Development - ', isDevelopment)

export const auth = betterAuth({
  basePath: '/server/auth',
  secret: Resource.BETTER_AUTH_SECRET.value,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  trustedOrigins: ['http://localhost:5173'],
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
      secure: isDevelopment ? false : true,
    },
  },
})
