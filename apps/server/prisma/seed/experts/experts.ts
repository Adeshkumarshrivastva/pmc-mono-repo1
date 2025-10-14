/* eslint-disable no-console */
import { SingleBar, Presets } from 'cli-progress'
import { nanoid } from 'nanoid'
import z from 'zod'
import experts from './experts.json'
import { DayOfWeek, ExpertGender, ExpertType, PrismaClient, ServiceMode } from '../../../src/generated/prisma'
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
        type: z.enum(ExpertType),
        qualification: z.string(),
        bio: z.string(),
        gender: z.enum(ExpertGender),
        expertise: z.string().array(),
        image: z.string(),
        experienceInYears: z.number().optional(),
        availableModes: z.enum(ServiceMode).array().min(1),
        price: z.number().min(1000),
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
        continue
      }

      const user = await prisma.user.create({
        data: {
          id: nanoid(),
          createdAt: dayjs().toDate(),
          updatedAt: dayjs().toDate(),
          name: validatedExpert.name,
          phoneNumber: validatedExpert.phoneNumber,
          phoneNumberVerified: true,
          email: validatedExpert.email,
          emailVerified: true,
          role: 'EXPERT',
        },
      })
      const createdExpert = await prisma.expert.create({
        data: {
          type: validatedExpert.type,
          name: expert.name,
          city: 'GURGAON',
          country: 'INDIA',
          slug: `${generateExpertSlug(expert.name)}`,
          qualifications: validatedExpert.qualification,
          image: validatedExpert.image,
          userId: user.id,
          bio: validatedExpert.bio,
          expertise: validatedExpert.expertise,
          gender: validatedExpert.gender,
          experienceInYears: validatedExpert.experienceInYears || null,
        },
      })

      const baseDate = dayjs.utc('2025-01-01')
      const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
      const availabilities = days.flatMap((day) => [
        { dayOfTheWeek: day, startHour: 4, startMinute: 30, endHour: 6, endMinute: 30 }, //  10:00 AM to 12:00 PM IST
        { dayOfTheWeek: day, startHour: 8, startMinute: 30, endHour: 11, endMinute: 30 }, //  2:00 PM to 5:00 PM IST
      ])

      await prisma.expertAvailability.createMany({
        data: availabilities.map((availability) => ({
          expertId: createdExpert.id,
          dayOfTheWeek: availability.dayOfTheWeek,
          startTime: baseDate.hour(availability.startHour).minute(availability.startMinute).toDate(),
          endTime: baseDate.hour(availability.endHour).minute(availability.endMinute).toDate(),
        })),
      })

      await prisma.service.create({
        data: {
          name: 'Initial Consultation',
          price: validatedExpert.price,
          city: 'GURGAON',
          country: 'INDIA',
          expertId: createdExpert.id,
          slug: 'initial-consultation',
          availableModes: validatedExpert.availableModes,
          paymentMode: validatedExpert.availableModes.includes('IN_PERSON') ? 'OFFLINE' : 'ONLINE',
          inPersonLocation: validatedExpert.availableModes.includes('IN_PERSON')
            ? {
                address: '804, Arcadia, South City II, Sector 49, Gurugram, Fatehpur, Haryana 122018',
                googleMapLink: 'https://maps.app.goo.gl/K3FgwML8LxX6ZyEm6',
              }
            : null,
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

function generateExpertSlug(name: string): string {
  const formattedName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const id = nanoid(4)

  return `${formattedName}-${id}`
}
