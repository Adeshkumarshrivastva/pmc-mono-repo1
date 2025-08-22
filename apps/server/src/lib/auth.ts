import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { Resource } from 'sst'
import { phoneNumber } from 'better-auth/plugins'
import { prisma } from './db'

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
    }),
  ],
})
