/* eslint-disable no-console */
import { PrismaClient } from '../../src/generated/prisma'
import { seedAdmins } from './admins/admins'
import { seedExperts } from './experts/experts'

const prisma = new PrismaClient()

async function main() {
  const seedMethods: { name: string; method: (prismaClient: PrismaClient) => Promise<void> }[] = []

  const seedAll = process.env.SEED_ALL === 'true'

  if (seedAll || process.env.SEED_EXPERTS === 'true') {
    seedMethods.push({ name: 'experts', method: seedExperts })
  }

  if (seedAll || process.env.SEED_ADMINS === 'true') {
    seedMethods.push({ name: 'admins', method: seedAdmins })
  }

  for (const { name, method } of seedMethods) {
    console.group(`🌱 Seeding ${name}...`)
    try {
      await method(prisma)
      console.log(`✅ Seeded ${name} successfully!`)
    } catch (error) {
      console.error(`❌ Error seeding ${name}: ${error}`)
    }
    console.groupEnd()
  }
}

main()
