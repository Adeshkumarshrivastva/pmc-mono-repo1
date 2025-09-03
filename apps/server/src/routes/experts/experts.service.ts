import { match } from 'ts-pattern'
import type { Dayjs } from 'dayjs'
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

const MINUTES_PER_HOUR = 60
const DAY_MAP: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

type TimeRange = { start: number; end: number }
type Slot = { startTime: number; displayTime: string }

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

    const serviceDuration = service.durationInMinutes

    const startOfMonth = dayjs(`${year}-${month}-01`).startOf('month').toDate()
    const endOfMonth = dayjs(`${year}-${month}-01`).endOf('month').toDate()

    const [weeklySchedule, blockDates, bookings] = await Promise.all([
      prisma.expertAvailability.findMany({
        where: {
          expertId,
        },
        select: {
          dayOfTheWeek: true,
          startTime: true,
          endTime: true,
          isActive: true,
        },
      }),

      prisma.expertBlockDates.findMany({
        where: {
          expertId,
          startDate: {
            lte: endOfMonth,
            gte: startOfMonth,
          },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      }),

      prisma.booking.findMany({
        where: {
          expertId,
          status: { in: ['BOOKED', 'DRAFT'] },
          startDateTime: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          startDateTime: true,
          endDateTime: true,
          serviceBufferTimeBeforeInMinutes: true,
          serviceBufferTimeAfterInMinutes: true,
          status: true,
        },
      }),
    ])

    const weeklyTemplate: TimeRange[][] = Array.from({ length: 7 }, () => [])

    weeklySchedule
      .filter((schedule) => schedule.isActive !== false)
      .forEach((schedule) => {
        const dayIndex = DAY_MAP[schedule.dayOfTheWeek]
        const start = dateToMinutes(schedule.startTime)
        const end = dateToMinutes(schedule.endTime)

        if (end > start) {
          weeklyTemplate[dayIndex].push({
            start,
            end,
          })
        }
      })

    const baseAvailability: { [date: string]: Slot[] } = {}

    const dates = getDatesInMonth(year, month)
    dates.forEach((date) => {
      const dayIndex = date.day()
      const daySchedule = weeklyTemplate[dayIndex]
      const dateStr = toDDMMYYYY(date)

      if (daySchedule.length === 0) {
        baseAvailability[dateStr] = []
        return
      }
      const slots = generateDaySlots(daySchedule, serviceDuration)

      baseAvailability[dateStr] = slots
    })

    blockDates.forEach((block) => {
      const start = dayjs(block.startDate).startOf('day')
      const end = dayjs(block.endDate).startOf('day')

      for (let current = start; !current.isAfter(end, 'day'); current = current.add(1, 'day')) {
        const dateStr = toDDMMYYYY(current)

        if (baseAvailability[dateStr]) {
          baseAvailability[dateStr] = []
        }
      }
    })

    bookings.forEach((booking) => {
      const start = dayjs(booking.startDateTime)
      const end = dayjs(booking.endDateTime)

      const bufferBefore = booking.serviceBufferTimeBeforeInMinutes
      const bufferAfter = booking.serviceBufferTimeAfterInMinutes

      const startWithBuffer = start.subtract(bufferBefore, 'minute')
      const endWithBuffer = end.add(bufferAfter, 'minute')

      const startDate = toDDMMYYYY(startWithBuffer)
      const endDate = toDDMMYYYY(endWithBuffer)

      const startMinute = dateToMinutes(startDate)
      const endMinute = dateToMinutes(endDate)

      const slots = baseAvailability[startDate] || []

      const isMultiDayBooking = !startWithBuffer.isSame(endWithBuffer, 'day')

      if (!isMultiDayBooking) {
        const filteredSlots = slots.filter(
          (slot) =>
            !isSlotOverlapping(
              { start: slot.startTime, end: slot.startTime + serviceDuration },
              { start: startMinute, end: endMinute },
            ),
        )

        baseAvailability[startDate] = filteredSlots
      } else {
        // TODO: handle multi-day booking
      }
    })

    return c.json({ availability: baseAvailability })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to get monthly available slots - ${errorMessage}` }, 500)
  }
}

function dateToMinutes(date: Date | string): number {
  const dt = dayjs(date)
  return dt.hour() * MINUTES_PER_HOUR + dt.minute()
}

function minutesToTimeString(minutes: number): string {
  return dayjs.duration(minutes, 'minutes').format('HH:mm')
}

function getDatesInMonth(year: number, month: number) {
  const startDate = dayjs(`${year}-${month}-01`)
  const daysInMonth = startDate.daysInMonth()

  return Array.from({ length: daysInMonth }, (_, i) => startDate.add(i, 'day'))
}

function generateDaySlots(daySchedule: TimeRange[], duration: number): Slot[] {
  const slots: Slot[] = []

  daySchedule.forEach((range) => {
    for (let time = range.start; time + duration < range.end; time += duration) {
      slots.push({
        startTime: time,
        displayTime: minutesToTimeString(time),
      })
    }
  })

  return slots
}

function isSlotOverlapping(slotA: TimeRange, slotB: TimeRange) {
  return slotA.start < slotB.end && slotA.end > slotB.start
}

function toDDMMYYYY(date: Dayjs) {
  return dayjs(date).format('DD-MM-YYYY')
}
