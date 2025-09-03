import { match } from 'ts-pattern'
import type { DayOfWeek, Prisma } from '../../generated/prisma'
import { type C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import {
  EXPERT_SERVICE_SELECT_FIELDS,
  type ExpertSearchQuery,
  type SortBy,
  type ExpertSearchResponse,
  type ExpertMonthlyAvailableSlotsQuery,
} from './experts.input'
import dayjs from '../../lib/dayjs'

export async function getExperts(c: C, query: ExpertSearchQuery) {
  try {
    const { page, limit } = query
    const skip = (page - 1) * limit

    const whereClause: Prisma.ExpertWhereInput = {}

    if (query.type) {
      whereClause.type = query.type
    }

    if (query.timezone) {
      whereClause.timezone = query.timezone
    }

    const serviceFilters: Prisma.ServiceWhereInput = {}

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
        { AND: [{ availableModes: { has: 'IN_PERSON' }, city: query.location }] },
      ]
    }

    if (Object.keys(serviceFilters).length > 0) {
      whereClause.servicesProvided = { some: serviceFilters }
    }

    const experts = await prisma.expert.findMany({
      where: whereClause,
      include: { servicesProvided: { select: EXPERT_SERVICE_SELECT_FIELDS } },
      skip,
      take: limit,
    })

    if (query.sortBy) {
      const sortBy = query.sortBy
      experts.sort((a, b) => {
        const aValue = getSortValue(sortBy, a)
        const bValue = getSortValue(sortBy, b)
        return match(query.sortOrder)
          .with('desc', () => (bValue > aValue ? 1 : bValue < aValue ? -1 : 0))
          .with('asc', () => (aValue > bValue ? 1 : aValue < bValue ? -1 : 0))
          .exhaustive()
      })
    }

    const totalCount = await prisma.expert.count({ where: whereClause })

    return c.json({
      experts,
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
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to search experts - ${errorMessage}` }, 500)
  }
}

function getSortValue(sortBy: SortBy, expert: ExpertSearchResponse): string | number {
  return match(sortBy)
    .with('price', () => Math.min(...expert.servicesProvided.map((s) => s.price)))
    .with('name', () => expert.name || '')
    .with('rating', () => expert.avgRating || 0)
    .exhaustive()
}

export async function getExpertFromSlug(c: C, expertSlug: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { slug: expertSlug },
      include: { servicesProvided: { select: EXPERT_SERVICE_SELECT_FIELDS } },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    return c.json({
      expert,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to get expert details - ${errorMessage}` }, 500)
  }
}

export async function getMonthlyAvailableSlots(c: C, query: ExpertMonthlyAvailableSlotsQuery) {
  try {
    const { serviceId, expertId, month, year } = query

    const service = await prisma.service.findUnique({
      where: { id: serviceId, expertId },
      select: { durationInMinutes: true },
    })

    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }

    const serviceDurationInMinutes = service.durationInMinutes

    const weeklyAvailability: {
      startTime: number
      endTime: number
    }[][] = Array.from({ length: 7 }, () => [])

    const startOfMonth = dayjs(`${year}-${month}-01`).startOf('month')
    const endOfMonth = startOfMonth.endOf('month')

    const [expertAvailability, expertBlockDates, expertExistingBookings] = await Promise.all([
      prisma.expertAvailability.findMany({
        where: {
          expertId,
        },
        select: {
          dayOfTheWeek: true,
          startTime: true,
          endTime: true,
        },
      }),
      prisma.expertBlockDates.findMany({
        where: {
          expertId,
          startDate: {
            lte: endOfMonth.toDate(),
            gte: startOfMonth.toDate(),
          },
        },
      }),
      prisma.booking.findMany({
        where: {
          expertId,
          startDateTime: {
            gte: startOfMonth.toDate(),
            lte: endOfMonth.toDate(),
          },
        },
      }),
    ])

    expertAvailability.forEach((availability) => {
      const day = availability.dayOfTheWeek
      const startTime = dayjs(availability.startTime).get('hour') * 60 + dayjs(availability.startTime).get('minute')
      const endTime = dayjs(availability.endTime).get('hour') * 60 + dayjs(availability.endTime).get('minute')

      weeklyAvailability[DAY_OF_WEEK_MAP[day]].push({
        startTime,
        endTime,
      })
    })

    const monthlyAvailableSlots: { [date: string]: number[] } = {}

    const dates = getDatesInMonth(year, month)
    dates.forEach((date) => {
      monthlyAvailableSlots[date.format('YYYY-MM-DD')] = []
      const dayAvailability = weeklyAvailability[date.day()]

      dayAvailability.forEach((timeRange) => {
        for (
          let minutes = timeRange.startTime;
          minutes + serviceDurationInMinutes <= timeRange.endTime;
          minutes += serviceDurationInMinutes
        ) {
          monthlyAvailableSlots[date.format('YYYY-MM-DD')].push(minutes)
        }
      })
    })

    expertBlockDates.forEach((block) => {
      const blockStartDate = dayjs(block.startDate).format('YYYY-MM-DD')
      const blockEndDate = dayjs(block.endDate).format('YYYY-MM-DD')

      Object.keys(monthlyAvailableSlots).forEach((date) => {
        if (date >= blockStartDate && date <= blockEndDate) {
          monthlyAvailableSlots[date] = []
        }
      })
    })

    expertExistingBookings.forEach((booking) => {
      const bookingDate = dayjs(booking.startDateTime).format('YYYY-MM-DD')
      const bufferTimeBefore = booking.serviceBufferTimeBeforeInMinutes
      const bufferTimeAfter = booking.serviceBufferTimeAfterInMinutes
      const bookingStartMinutes =
        dayjs(booking.startDateTime).get('hour') * 60 + dayjs(booking.startDateTime).get('minute') - bufferTimeBefore
      const bookingEndMinutes =
        dayjs(booking.endDateTime).get('hour') * 60 + dayjs(booking.endDateTime).get('minute') + bufferTimeAfter

      if (monthlyAvailableSlots[bookingDate]) {
        monthlyAvailableSlots[bookingDate] = monthlyAvailableSlots[bookingDate].filter(
          (slotStartMinutes) =>
            !isSlotOverlapping(
              { start: slotStartMinutes, end: slotStartMinutes + serviceDurationInMinutes },
              { start: bookingStartMinutes, end: bookingEndMinutes },
            ),
        )
      }
    })

    return c.json({ monthlyAvailableSlots })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to get monthly available slots - ${errorMessage}` }, 500)
  }
}

function getDatesInMonth(year: number, month: number) {
  const startDate = dayjs(`${year}-${month}-01`)
  const daysInMonth = startDate.daysInMonth()

  return Array.from({ length: daysInMonth }, (_, i) => startDate.add(i, 'day'))
}

function isSlotOverlapping(slotA: { start: number; end: number }, slotB: { start: number; end: number }) {
  return slotA.start <= slotB.end && slotA.end >= slotB.start
}

const DAY_OF_WEEK_MAP: { [key in DayOfWeek]: number } = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}
