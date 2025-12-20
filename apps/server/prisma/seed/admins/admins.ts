import { SingleBar, Presets } from 'cli-progress'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import * as z from 'zod'
import type { PrismaClient } from '../../../src/generated/prisma'
import adminsData from './admins.json'

export async function seedAdmins(prisma: PrismaClient) {
  const adminsDataParsed = z
    .array(
      z.object({
        name: z.string(),
        phone: z.string(),
      }),
    )
    .parse(adminsData)

  const progressBar = new SingleBar({}, Presets.shades_classic)
  progressBar.start(adminsDataParsed.length, 0)

  for (const admin of adminsDataParsed) {
    try {
      await prisma.user.upsert({
        where: {
          phoneNumber: admin.phone,
        },
        update: {
          name: admin.name,
          email: `${admin.phone}@pmc.com`,
          phoneNumberVerified: true,
          role: 'ADMIN',
          updatedAt: dayjs().toDate(),
        },
        create: {
          id: nanoid(),
          name: admin.name,
          email: `${admin.phone}@pmc.com`,
          emailVerified: false,
          phoneNumber: admin.phone,
          phoneNumberVerified: true,
          role: 'ADMIN',
          createdAt: dayjs().toDate(),
          updatedAt: dayjs().toDate(),
        },
      })
    } catch (error) {
      console.error(error)
    }
    progressBar.increment()
  }

  progressBar.stop()
  console.log('Admins seeding completed')
}
