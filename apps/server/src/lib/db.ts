import { PrismaClient } from '../generated/prisma'
import { env } from './env'

export { type PrismaClient }

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export const PRISMA_ERROR_CODES = {
  NOT_FOUND: 'P1003',
} as const
