import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { Resource } from 'sst'
import { prisma } from './db'

export const auth = betterAuth({
  baseURL: Resource.PmcRouter.url,
  secret: Resource.BETTER_AUTH_SECRET.value,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  trustedOrigins: [Resource.PmcRouter.url],
})
