import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { zValidator } from '@hono/zod-validator'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { match } from 'ts-pattern'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const prisma = new PrismaClient()

const app = new Hono()

app.use('*', logger())

const expertSearchQuery = z.object({
  type: z.enum(['PSYCHOLOGIST', 'PSYCHIATRIST', 'CLINICAL_PSYCHOLOGIST']).optional(),
  serviceMode: z.enum(['IN_PERSON', 'VIRTUAL']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
  timezone: z.string().optional(),
  availableOn: z.string().optional(),
  availableAt: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['price', 'rating', 'availability', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

const availabilityQuery = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  serviceId: z.string().optional(),
})

export type ExpertSearchQuery = z.infer<typeof expertSearchQuery>
export type AvailabilityQuery = z.infer<typeof availabilityQuery>

type ExpertSearchResponse = {
  id: string
  user: {
    name: string | null
    email: string
    image: string | null
  }
  type: 'PSYCHOLOGIST' | 'PSYCHIATRIST' | 'CLINICAL_PSYCHOLOGIST'
  timezone: string
  services: Array<{
    id: string
    name: string
    price: number
    currency: string
    durationInMinutes: number
    availableModes: ('IN_PERSON' | 'VIRTUAL')[]
    tags: string[]
    inPersonLocation?: unknown
    isPartialPaymentAvailable: boolean
    minPaymentAmount: number | null
  }>
  availability: Array<{
    dayOfTheWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
    startTime: Date
    endTime: Date
  }>
  blockedDates: Date[]
  averageRating?: number
  totalBookings?: number
  nextAvailableSlot?: Date | null
}

type ServiceFilters = {
  availableModes?: { has: 'IN_PERSON' | 'VIRTUAL' }
  price?: {
    gte?: number
    lte?: number
  }
  tags?: { hasSome: string[] }
  OR?: Array<
    | { availableModes: { has: 'VIRTUAL' } }
    | {
        AND: Array<{
          availableModes: { has: 'IN_PERSON' }
          inPersonLocation: {
            path: ['city']
            string_contains: string
          }
        }>
      }
  >
}

type ExpertWhereClause = {
  type?: 'PSYCHOLOGIST' | 'PSYCHIATRIST' | 'CLINICAL_PSYCHOLOGIST'
  timezone?: string
  servicesProvided?: {
    some: ServiceFilters
  }
}

type BookingData = {
  startDateTime: Date
  endDateTime: Date
}

type DayOfWeek = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'

type SortBy = 'price' | 'rating' | 'availability' | 'name'

function getDayOfWeek(date: dayjs.Dayjs): DayOfWeek {
  const days: readonly DayOfWeek[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ] as const
  return days[date.day()]
}

app.get('/experts', zValidator('query', expertSearchQuery), async (c) => {
  try {
    const query = c.req.valid('query')
    const { page, limit } = query
    const skip = (page - 1) * limit

    const whereClause: ExpertWhereClause = {}

    if (query.type) {
      whereClause.type = query.type
    }

    if (query.timezone) {
      whereClause.timezone = query.timezone
    }

    const serviceFilters: ServiceFilters = {}

    if (query.serviceMode) {
      serviceFilters.availableModes = { has: query.serviceMode }
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      serviceFilters.price = {}
      if (query.minPrice !== undefined) {
        serviceFilters.price.gte = query.minPrice
      }
      if (query.maxPrice !== undefined) {
        serviceFilters.price.lte = query.maxPrice
      }
    }

    if (query.tags) {
      const tagList = query.tags.split(',').map((tag) => tag.trim())
      serviceFilters.tags = { hasSome: tagList }
    }

    if (query.location) {
      serviceFilters.OR = [
        { availableModes: { has: 'VIRTUAL' } },
        {
          AND: [
            {
              availableModes: { has: 'IN_PERSON' },
              inPersonLocation: {
                path: ['city'],
                string_contains: query.location,
              },
            },
          ],
        },
      ]
    }

    if (Object.keys(serviceFilters).length > 0) {
      whereClause.servicesProvided = { some: serviceFilters }
    }

    let experts = await prisma.expert.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        servicesProvided: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            durationInMinutes: true,
            availableModes: true,
            tags: true,
            inPersonLocation: true,
            isPartialPaymentAvailable: true,
            minPaymentAmount: true,
          },
        },
        availability: true,
        blockedDates: {
          where: { date: { gte: dayjs().toDate() } },
        },
        bookings: {
          where: { status: { in: ['BOOKED', 'COMPLETED'] } },
          select: { id: true, status: true },
        },
      },
      skip,
      take: limit,
    })

    if (query.availableOn) {
      const availableDate = dayjs(query.availableOn)
      const filteredExperts = []

      for (const expert of experts) {
        const isAvailable = await isExpertAvailable(expert.id, availableDate, query.availableAt)
        if (isAvailable) {
          filteredExperts.push(expert)
        }
      }
      experts = filteredExperts
    }

    const response: ExpertSearchResponse[] = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      experts.map(async (expert: any) => {
        const totalBookings = expert?.bookings?.length
        const nextAvailableSlot = await getNextAvailableSlot(expert.id)

        return {
          id: expert.id,
          user: expert.user,
          type: expert.type,
          timezone: expert.timezone,
          services: expert.servicesProvided,
          availability: expert.availability,
          blockedDates: expert.blockedDates.map((bd: { date: Date }) => bd.date),
          totalBookings,
          nextAvailableSlot,
        }
      }),
    )

    if (query.sortBy) {
      response.sort((a, b) => {
        const aValue = getSortValue(query.sortBy!, a)
        const bValue = getSortValue(query.sortBy!, b)

        return match(query.sortOrder)
          .with('desc', () => (bValue > aValue ? 1 : bValue < aValue ? -1 : 0))
          .with('asc', () => (aValue > bValue ? 1 : aValue < bValue ? -1 : 0))
          .exhaustive()
      })
    }

    const totalCount = await prisma.expert.count({ where: whereClause })

    return c.json({
      experts: response,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filters: query,
    })
  } catch (error: unknown) {
    console.error('Expert search error:', error)

    const errorMessage = match(error)
      .when(
        (e): e is Error => e instanceof Error,
        (e) => e.message,
      )
      .otherwise(() => 'Unknown error')

    return c.json(
      {
        error: 'Failed to search experts',
        details: errorMessage,
      },
      500,
    )
  }
})

app.get('/experts/:id', async (c) => {
  try {
    const expertId = c.req.param('id')

    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            phoneNumber: true,
          },
        },
        servicesProvided: true,
        availability: true,
        blockedDates: {
          where: { date: { gte: dayjs().toDate() } },
        },
        bookings: {
          where: { status: { in: ['BOOKED', 'COMPLETED'] } },
          include: {
            patient: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    const totalBookings = expert.bookings.length
    const completedBookings = expert.bookings.filter((b: { status: string }) => b.status === 'COMPLETED').length
    const nextAvailableSlot = await getNextAvailableSlot(expert.id)

    return c.json({
      expert: {
        ...expert,
        statistics: {
          totalBookings,
          completedBookings,
          completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        },
        nextAvailableSlot,
      },
    })
  } catch (error: unknown) {
    console.error('Get expert error:', error)

    const errorMessage = match(error)
      .when(
        (e): e is Error => e instanceof Error,
        (e) => e.message,
      )
      .otherwise(() => 'Unknown error')

    return c.json(
      {
        error: 'Failed to get expert details',
        details: errorMessage,
      },
      500,
    )
  }
})

app.get('/experts/:id/availability', zValidator('query', availabilityQuery), async (c) => {
  try {
    const expertId = c.req.param('id')
    const query = c.req.valid('query')

    const startDate = query.startDate ? dayjs(query.startDate) : dayjs()
    const endDate = query.endDate ? dayjs(query.endDate) : startDate.add(30, 'day')

    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      include: {
        availability: true,
        blockedDates: {
          where: {
            date: {
              gte: startDate.toDate(),
              lte: endDate.toDate(),
            },
          },
        },
        servicesProvided: query.serviceId ? { where: { id: query.serviceId } } : undefined,
      },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    const slots: Array<{ startTime: Date; endTime: Date; available: boolean }> = []
    const blockedDateSet = new Set(expert.blockedDates.map((bd: { date: Date }) => dayjs(bd.date).format('YYYY-MM-DD')))

    const existingBookings = await prisma.booking.findMany({
      where: {
        expertId,
        startDateTime: { gte: startDate.toDate(), lte: endDate.toDate() },
        status: { in: ['BOOKED', 'DRAFT'] },
      },
      select: { startDateTime: true, endDateTime: true },
    })

    const serviceDuration =
      query.serviceId && expert.servicesProvided?.[0] ? expert.servicesProvided[0].durationInMinutes : 60

    for (let currentDate = startDate; currentDate.diff(endDate, 'day') <= 0; currentDate = currentDate.add(1, 'day')) {
      if (blockedDateSet.has(currentDate.format('YYYY-MM-DD'))) {
        continue
      }

      const dayOfWeek = getDayOfWeek(currentDate)
      const dayAvailability = expert.availability.find((a: { dayOfTheWeek: DayOfWeek }) => a.dayOfTheWeek === dayOfWeek)

      if (dayAvailability) {
        const dayStart = currentDate
          .hour(dayjs(dayAvailability.startTime).hour())
          .minute(dayjs(dayAvailability.startTime).minute())
          .second(0)
          .millisecond(0)

        const dayEnd = currentDate
          .hour(dayjs(dayAvailability.endTime).hour())
          .minute(dayjs(dayAvailability.endTime).minute())
          .second(0)
          .millisecond(0)

        for (
          let slotStart = dayStart;
          slotStart.valueOf() < dayEnd.valueOf();
          slotStart = slotStart.add(30, 'minute')
        ) {
          const slotEnd = slotStart.add(serviceDuration, 'minute')

          if (slotEnd.valueOf() > dayEnd.valueOf()) {
            break
          }

          const hasConflict = existingBookings.some((booking: BookingData) => {
            const bookingStartTime = dayjs(booking.startDateTime).valueOf()
            const bookingEndTime = dayjs(booking.endDateTime).valueOf()
            const slotStartTime = slotStart.valueOf()
            const slotEndTime = slotEnd.valueOf()

            return (
              (slotStartTime >= bookingStartTime && slotStartTime < bookingEndTime) ||
              (slotEndTime > bookingStartTime && slotEndTime <= bookingEndTime) ||
              (slotStartTime <= bookingStartTime && slotEndTime >= bookingEndTime)
            )
          })

          if (!hasConflict && slotStart.valueOf() > dayjs().valueOf()) {
            slots.push({
              startTime: slotStart.toDate(),
              endTime: slotEnd.toDate(),
              available: true,
            })
          }
        }
      }
    }

    return c.json({
      expertId,
      period: { start: startDate.toDate(), end: endDate.toDate() },
      serviceDuration,
      totalSlots: slots.length,
      availableSlots: slots,
    })
  } catch (error: unknown) {
    console.error('Get availability error:', error)

    const errorMessage = match(error)
      .when(
        (e): e is Error => e instanceof Error,
        (e) => e.message,
      )
      .otherwise(() => 'Unknown error')

    return c.json(
      {
        error: 'Failed to get expert availability',
        details: errorMessage,
      },
      500,
    )
  }
})

app.onError((err, c) => {
  console.error('API Error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

async function isExpertAvailable(expertId: string, targetDate: dayjs.Dayjs, targetTime?: string): Promise<boolean> {
  const dayOfWeek = getDayOfWeek(targetDate)

  const availability = await prisma.expertAvailability.findFirst({
    where: {
      expertId,
      dayOfTheWeek: dayOfWeek,
    },
  })

  if (!availability) {
    return false
  }

  const isBlocked = await prisma.expertBlockDates.findFirst({
    where: {
      expertId,
      date: {
        gte: targetDate.startOf('day').toDate(),
        lt: targetDate.endOf('day').toDate(),
      },
    },
  })

  if (isBlocked) {
    return false
  }

  if (targetTime) {
    const [hours, minutes] = targetTime.split(':').map(Number)
    const targetDateTime = targetDate.hour(hours).minute(minutes).second(0).millisecond(0)
    const availabilityStartTime = dayjs(availability.startTime).valueOf()
    const availabilityEndTime = dayjs(availability.endTime).valueOf()
    const targetDateTimeValue = targetDateTime.valueOf()

    return targetDateTimeValue >= availabilityStartTime && targetDateTimeValue <= availabilityEndTime
  }

  return true
}

async function getNextAvailableSlot(expertId: string): Promise<Date | null> {
  const now = dayjs()
  const availability = await prisma.expertAvailability.findMany({
    where: { expertId },
    orderBy: [{ dayOfTheWeek: 'asc' }, { startTime: 'asc' }],
  })

  const blockedDates = await prisma.expertBlockDates.findMany({
    where: {
      expertId,
      date: { gte: now.toDate() },
    },
  })

  const blockedDateSet = new Set(blockedDates.map((bd: { date: Date }) => dayjs(bd.date).format('YYYY-MM-DD')))

  for (let i = 0; i < 30; i++) {
    const checkDate = now.add(i, 'day')

    if (blockedDateSet.has(checkDate.format('YYYY-MM-DD'))) {
      continue
    }

    const dayOfWeek = getDayOfWeek(checkDate)
    const dayAvailability = availability.find((a: { dayOfTheWeek: DayOfWeek }) => a.dayOfTheWeek === dayOfWeek)

    if (dayAvailability) {
      const slotDate = checkDate
        .hour(dayjs(dayAvailability.startTime).hour())
        .minute(dayjs(dayAvailability.startTime).minute())
        .second(0)
        .millisecond(0)

      if (i === 0 && slotDate.valueOf() <= now.valueOf()) {
        continue
      }

      return slotDate.toDate()
    }
  }

  return null
}

function getSortValue(sortBy: SortBy, expert: ExpertSearchResponse): string | number {
  return match(sortBy)
    .with('price', () => Math.min(...expert.services.map((s) => s.price)))
    .with('name', () => expert.user.name || '')
    .with('availability', () => (expert.nextAvailableSlot ? dayjs(expert.nextAvailableSlot).valueOf() : Infinity))
    .with('rating', () => expert.averageRating || 0)
    .exhaustive()
}

export default app
