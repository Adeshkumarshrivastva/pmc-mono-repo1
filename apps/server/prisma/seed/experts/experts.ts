/* eslint-disable no-console */
import { SingleBar, Presets } from 'cli-progress'
import { nanoid } from 'nanoid'
import z from 'zod'
import experts from './experts.json'
import { DayOfWeek, ExpertType, PrismaClient } from '../../../src/generated/prisma'
import { getErrorMessage } from '../../../src/lib/utils'
import dayjs from '../../../src/lib/dayjs'

export async function seedExperts(prisma: PrismaClient) {
  const errors: { name: string; errorMessage: string }[] = []
  const progressBar = new SingleBar({}, Presets.shades_classic)
  progressBar.start(experts.length, 0)

  for (const expert of experts) {
    const validatedExpert = z
      .object({
        name: z.string(),
        phoneNumber: z.string(),
        email: z.string(),
        type: z.nativeEnum(ExpertType),
        qualification: z.string(),
        image: z.string(),
      })
      .parse(expert)

    try {
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber: validatedExpert.phoneNumber },
      })
      if (existingUser) {
        errors.push({
          name: validatedExpert.name,
          errorMessage: ' User with mobile ${validatedExpert.phoneNumber} already exists. Skipping...',
        })
      }

      const user = await prisma.user.create({
        data: {
          id: nanoid(),
          createdAt: dayjs().toDate(),
          updatedAt: dayjs().toDate(),
          name: validatedExpert.name,
          phoneNumber: validatedExpert.phoneNumber,
          email: validatedExpert.email,
          emailVerified: true,
          role: 'EXPERT',
        },
      })
      const createdExpert = await prisma.expert.create({
        data: {
          type: validatedExpert.type,
          qualifications: validatedExpert.qualification,
          userId: user.id,
        },
      })

      const baseDate = dayjs.utc('2025-01-01')
      const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      const availabilities = days.flatMap((day) => [
        { dayOfTheWeek: day, start: 10, end: 12 },
        { dayOfTheWeek: day, start: 14, end: 17 },
      ])

      await prisma.expertAvailability.createMany({
        data: availabilities.map((availability) => ({
          expertId: createdExpert.id,
          dayOfTheWeek: availability.dayOfTheWeek,
          startTime: baseDate.hour(availability.start).minute(0).toDate(),
          endTime: baseDate.hour(availability.end).minute(0).toDate(),
        })),
      })

      await prisma.service.create({
        data: {
          name: 'Initial Consultation',
          price: 1000,
          expertId: createdExpert.id,
        },
      })
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      errors.push({ name: expert.name, errorMessage })
    } finally {
      progressBar.increment()
    }
  }

  progressBar.stop()
  console.groupEnd()

  console.group('📊 User seeding summary:')
  const userCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true },
  })

  userCounts.forEach((count) => {
    console.log(`${count.role}: ${count._count.role} users`)
  })

  if (errors.length > 0) {
    console.log(`\nErrors`)
    for (const item of errors) {
      console.log(`Error in creating Experts - ${item.name} - ${item.errorMessage}`)
    }
  }
}
