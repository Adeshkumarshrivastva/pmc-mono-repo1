import { match } from 'ts-pattern'
import type { Prisma } from '../../generated/prisma'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import {
  EXPERT_SERVICE_SELECT_FIELDS,
  type ExpertSearchQuery,
  type SortBy,
  type ExpertSearchResponse,
  type ExpertMonthlyAvailableSlotsQuery,
  type ExpertBookingsSearchQuery,
  type CreatePrescriptionInput,
  type UpdatePrescriptionInput,
  type ExpertProfileInput,
} from './experts.input'
import dayjs from '../../lib/dayjs'
import {
  DAY_MAP,
  generateDaySlots,
  getDatesInMonth,
  isSlotOverlapping,
  type Slot,
  type TimeRange,
} from '../../lib/booking'
import { dateToMinutes, toDDMMYYYY } from '../../lib/date'
import { generatePrescriptionPDF } from '../../lib/prescription'

export async function getExperts(c: C, query: ExpertSearchQuery) {
  try {
    const { page, limit } = query
    const skip = (page - 1) * limit

    const whereClause: Prisma.ExpertWhereInput = {}

    if (query.search) {
      whereClause.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },

        {
          user: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      ]
    }

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

    if (query.location) {
      whereClause.city = query.location
    }

    if (query.expertise) {
      whereClause.expertise = {
        hasSome: query.expertise,
      }
    }
    if (query.gender) {
      whereClause.gender = query.gender
    }

    if (Object.keys(serviceFilters).length > 0) {
      whereClause.servicesProvided = { some: serviceFilters }
    }

    const experts = await prisma.expert.findMany({
      where: whereClause,
      include: {
        servicesProvided: { select: EXPERT_SERVICE_SELECT_FIELDS },
        user: { select: { id: true, name: true, image: true } },
        availability: true,
      },
      skip,
      take: limit,
    })

    if (query.sortBy) {
      const sortBy = query.sortBy
      experts.sort((a, b) => {
        const aValue = getSortValue(sortBy, a)
        const bValue = getSortValue(sortBy, b)
        return match(query.sortOrder)
          .with('asc', () => (aValue > bValue ? 1 : aValue < bValue ? -1 : 0))
          .with('desc', () => (bValue > aValue ? 1 : bValue < aValue ? -1 : 0))
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
      include: {
        servicesProvided: { select: EXPERT_SERVICE_SELECT_FIELDS },
      },
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

export async function getExpertServiceFromSlug(c: C, expertSlug: string, serviceSlug: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { slug: expertSlug },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    const service = await prisma.service.findFirst({
      where: {
        slug: serviceSlug,
        expertId: expert.id,
        isDeleted: { not: true },
      },
      include: { expert: true },
    })

    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }

    return c.json(service)
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to get service details - ${errorMessage}` }, 500)
  }
}

export async function getExpertMonthlyAvailableSlots(
  c: C,
  expertSlug: string,
  serviceSlug: string,
  query: ExpertMonthlyAvailableSlotsQuery,
) {
  try {
    const { month, year } = query

    const expert = await prisma.expert.findFirst({
      where: { slug: expertSlug },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    const service = await prisma.service.findFirst({
      where: {
        slug: serviceSlug,
        expertId: expert.id,
        isDeleted: { not: true },
      },
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
          expertId: expert.id,
          isActive: { not: false },
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
          expertId: expert.id,
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
          expertId: expert.id,
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

    weeklySchedule.forEach((schedule) => {
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

    const now = dayjs().utc()
    const currentMinutes = dateToMinutes(now.toDate())

    const dates = getDatesInMonth(year, month)

    dates.forEach((date) => {
      const dayIndex = date.day()
      const daySchedule = weeklyTemplate[dayIndex]
      const dateStr = toDDMMYYYY(date)

      if (date.isBefore(now, 'day')) {
        baseAvailability[dateStr] = []
      } else if (daySchedule.length === 0) {
        baseAvailability[dateStr] = []
      } else {
        let slots = generateDaySlots(daySchedule, serviceDuration)

        if (date.isSame(now, 'day')) {
          slots = slots.filter((slot) => slot.startTime > currentMinutes)
        }

        baseAvailability[dateStr] = slots
      }
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

      const startMinute = dateToMinutes(booking.startDateTime)
      const endMinute = dateToMinutes(booking.endDateTime)

      const startDateStr = toDDMMYYYY(startWithBuffer)

      const slots = baseAvailability[startDateStr] || []

      const isMultiDayBooking = !startWithBuffer.isSame(endWithBuffer, 'day')

      if (!isMultiDayBooking) {
        const filteredSlots = slots.filter(
          (slot) =>
            !isSlotOverlapping(
              { start: slot.startTime, end: slot.startTime + serviceDuration },
              { start: startMinute, end: endMinute },
            ),
        )

        baseAvailability[startDateStr] = filteredSlots
      } else {
        // TODO: handle multi-day booking edge-case
      }
    })

    Object.keys(baseAvailability).forEach((dateStr) => {
      baseAvailability[dateStr] = baseAvailability[dateStr].sort((a, b) => a.startTime - b.startTime)
    })

    return c.json({ availability: baseAvailability })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to get monthly available slots - ${errorMessage}` }, 500)
  }
}

export async function getExpertBooking(c: C, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      expert: true,
    },
  })

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  return c.json({ success: true, booking })
}

export async function getExpertBookings(c: C, input: ExpertBookingsSearchQuery) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const expert = await prisma.expert.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    const bookingsWhereInput: Prisma.BookingWhereInput = {
      expertId: expert.id,
    }
    const now = dayjs().toDate()

    if (input.period === 'upcoming') {
      bookingsWhereInput.OR = [
        { startDateTime: { gte: now } },
        // currently ongoing bookings
        { startDateTime: { lt: now }, endDateTime: { gt: now } },
      ]
    } else if (input.period === 'past') {
      bookingsWhereInput.endDateTime = { lt: now }
    } else if (input.period === 'fixed') {
      bookingsWhereInput.startDateTime = { gte: input.startDate }

      bookingsWhereInput.endDateTime = { lte: input.endDate }
    }

    const bookings = await prisma.booking.findMany({
      where: bookingsWhereInput,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        prescription: true,
        payments: true,
      },
      orderBy: input.period === 'past' ? { endDateTime: 'desc' } : { startDateTime: 'asc' },
    })

    return c.json({ success: true, bookings })
  } catch {
    return c.json({ error: 'Failed to fetch booking' }, 500)
  }
}

export async function createPrescription(c: C, input: CreatePrescriptionInput) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const expert = await prisma.expert.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      select: {
        id: true,
        expertId: true,
        status: true,
      },
    })

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404)
    }

    if (booking.expertId !== expert.id) {
      return c.json({ error: 'Unauthorized to create prescription for this booking' }, 403)
    }

    // TODO: throw error on booking status not in ['BOOKED', 'COMPLETED']

    const existingPrescription = await prisma.prescription.findFirst({
      where: { bookingId: input.bookingId },
    })

    if (existingPrescription) {
      return c.json({ error: 'Prescription already exists for this booking' }, 400)
    }

    const prescription = await prisma.prescription.create({
      data: {
        bookingId: input.bookingId,
        medicines: input.medicines,
        notes: input.notes,
      },
    })

    return c.json({
      success: true,
      prescription,
    })
  } catch (error) {
    return c.json({ error: `Failed to create prescription - ${getErrorMessage(error)}` }, 500)
  }
}

export async function updatePrescription(c: C, input: UpdatePrescriptionInput) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const expert = await prisma.expert.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      select: {
        id: true,
        expertId: true,
        status: true,
      },
    })

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404)
    }

    if (booking.expertId !== expert.id) {
      return c.json({ error: 'Unauthorized to create prescription for this booking' }, 403)
    }

    // TODO: Throw error if Booking status not in ['COMPLETED', 'BOOKED']

    const existingPrescription = await prisma.prescription.findFirst({
      where: { bookingId: input.bookingId },
    })

    if (!existingPrescription) {
      return c.json({ error: 'Prescription not found' })
    }

    await prisma.prescription.update({
      where: {
        id: input.prescriptionId,
      },
      data: {
        medicines: input.medicines,
        notes: input.notes,
      },
    })

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: `Failed to update prescription - ${getErrorMessage(error)}` })
  }
}

export async function downloadPrescription(c: C, prescriptionId: string) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        booking: {
          include: {
            expert: true,
            patient: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!prescription) {
      return c.json({ error: 'Prescription not found' }, 404)
    }

    if (!(prescription.booking.expert.userId !== userId || prescription.booking.patient.userId !== userId)) {
      return c.json({ error: 'Unauthorized to download this prescription' }, 403)
    }

    const buffer = await generatePrescriptionPDF(prescription)

    return c.body(buffer, 200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=prescription-${prescriptionId}.pdf`,
    })
  } catch (error) {
    return c.json({ error: `Failed to download prescription - ${getErrorMessage(error)}` })
  }
}

export async function getExpert(c: C) {
  const userId = c.var.user?.id
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 400)
  }
  const expert = await prisma.expert.findUnique({
    where: { userId },
    include: { file: true },
  })

  if (!expert) {
    return c.json({ error: 'Expert profile not found' }, 404)
  }

  return c.json(expert)
}

export async function updateExpert(c: C, data: ExpertProfileInput) {
  const userId = c.var.user?.id
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 400)
  }

  const expert = await prisma.expert.findUnique({ where: { userId } })
  if (!expert) {
    return c.json({ error: 'Expert profile not found' }, 404)
  }

  const updated = await prisma.expert.update({
    where: { id: expert.id },
    data,
    include: { file: true },
  })

  return c.json(updated)
}

export async function updatePaymentStatus(c: C, input: { status: 'PENDING' | 'COMPLETED' }) {
  const userId = c.var.user?.id
  const bookingId = c.req.param('bookingId')

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 400)
  }

  const expert = await prisma.expert.findUnique({
    where: { userId },
  })

  if (!expert) {
    return c.json({ error: 'Expert profile not found' }, 404)
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      expert: { select: { id: true } },
    },
  })

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  if (booking.expert.id !== expert.id) {
    return c.json({ error: 'Unauthorized: You do not own this booking' }, 403)
  }

  if (booking.status === 'CANCELLED') {
    return c.json({ error: 'Cannot update payment for cancelled booking' }, 400)
  }

  const payment = await prisma.payment.findFirst({
    where: {
      bookingId,
      paymentMode: 'OFFLINE',
    },
  })

  if (!payment) {
    return c.json({ error: 'No offline payment found for this booking' }, 404)
  }

  if (payment.paymentMode !== 'OFFLINE') {
    return c.json({ error: 'Can only manually update offline payments' }, 400)
  }

  if (payment.status === input.status) {
    return c.json({ error: `Payment is already marked as ${input.status}` }, 400)
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: input.status },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: input.status === 'COMPLETED' ? 'BOOKED' : booking.status,
      },
    }),
  ])

  return c.json({ success: true, message: `Payment status updated to ${input.status}` })
}

export async function getAllExperts(c: C) {
  const experts = await prisma.expert.findMany()
  return c.json(experts)
}
