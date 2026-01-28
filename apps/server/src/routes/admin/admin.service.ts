import { nanoid } from 'nanoid'
import { generateKeyBetween } from 'fractional-indexing'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import dayjs from '../../lib/dayjs'
import type {
  UpdateExpertInfoInput,
  UpdateAvailabilityInput,
  CreateExpertInput,
  CreateServiceForExpertInput,
  UpdateServiceForExpertInput,
  BulkCreateBlockedDatesInput,
  ReorderExpertsInput,
} from './admin.input'
import { DayOfWeek } from '../../generated/prisma'
import { dateToMinutes } from '../../lib/date'
import { getErrorMessage } from '../../lib/utils'

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

export async function getAdminDashboard(c: C) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const now = dayjs().toDate()
    const thirtyDaysAgo = dayjs().subtract(30, 'days').toDate()

    const [
      totalExperts,
      totalPatients,
      totalBookings,
      totalRevenue,
      upcomingBookings,
      recentBookings,
      completedBookings,
      cancelledBookings,
      pendingPayments,
      recentExperts,
      recentPatients,
      bookingsByStatus,
    ] = await Promise.all([
      prisma.expert.count({ where: { isDeleted: false } }),
      prisma.patient.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
        },
        _sum: {
          amountPaid: true,
        },
      }),
      prisma.booking.count({
        where: {
          OR: [{ startDateTime: { gte: now } }, { startDateTime: { lt: now }, endDateTime: { gt: now } }],
        },
      }),
      prisma.booking.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          expert: {
            include: {
              user: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
          service: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.booking.count({
        where: {
          status: 'COMPLETED',
        },
      }),
      prisma.booking.count({
        where: {
          status: 'CANCELLED',
        },
      }),
      prisma.payment.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.expert.findMany({
        where: { isDeleted: false },
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.patient.findMany({
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
    ])

    return c.json({
      success: true,
      stats: {
        totalExperts,
        totalPatients,
        totalBookings,
        totalRevenue: totalRevenue._sum.amountPaid || 0,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        pendingPayments,
      },
      recentBookings,
      recentExperts,
      recentPatients,
      bookingsByStatus,
    })
  } catch {
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
}

export async function createExpert(c: C, input: CreateExpertInput) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, ...(input.phoneNumber ? [{ phoneNumber: input.phoneNumber }] : [])],
      },
    })

    if (existingUser) {
      const existingExpert = await prisma.expert.findUnique({
        where: { userId: existingUser.id },
      })

      if (existingExpert) {
        return c.json({ error: 'An expert profile already exists for this user' }, 400)
      }
    }

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'EXPERT' },
      })
    } else {
      const newUser = await prisma.user.create({
        data: {
          id: nanoid(),
          email: input.email,
          phoneNumber: input.phoneNumber,
          emailVerified: false,
          phoneNumberVerified: input.phoneNumber ? true : false,
          name: input.name,
          role: 'EXPERT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      userId = newUser.id
    }

    const slug = generateExpertSlug(input.name)

    const lastExpert = await prisma.expert.findFirst({
      where: { isDeleted: false },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = generateKeyBetween(lastExpert ? lastExpert.order : null, null)

    const expert = await prisma.expert.create({
      data: {
        userId,
        slug,
        name: input.name,
        type: input.type,
        qualifications: input.qualifications,
        bio: input.bio,
        gender: input.gender,
        city: input.city,
        country: input.country,
        timezone: input.timezone,
        expertise: input.expertise,
        experienceInYears: input.experienceInYears,
        photoId: input.photoId,
        order: newOrder,
      },
      include: {
        user: true,
      },
    })

    return c.json({ success: true, expert })
  } catch (error) {
    return c.json({ error: `Failed to create expert - ${getErrorMessage(error)}` }, 500)
  }
}

export async function getExpertDetails(c: C, expertId: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      include: {
        user: true,
        servicesProvided: true,
        availability: true,
        file: true,
      },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    return c.json(expert)
  } catch {
    return c.json({ error: 'Failed to fetch expert details' }, 500)
  }
}

export async function updateExpertInfo(c: C, expertId: string, input: UpdateExpertInfoInput) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { userId: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    // Update user's email and phone number
    await prisma.user.update({
      where: { id: expert.userId },
      data: {
        email: input.email,
        phoneNumber: input.phoneNumber,
      },
    })

    // Update expert information
    const updatedExpert = await prisma.expert.update({
      where: { id: expertId },
      data: {
        name: input.name,
        qualifications: input.qualifications,
        bio: input.bio,
        gender: input.gender,
        city: input.city,
        country: input.country,
        timezone: input.timezone,
        expertise: input.expertise,
        photoId: input.photoId,
        experienceInYears: input.experienceInYears,
      },
    })

    return c.json({ success: true, expert: updatedExpert })
  } catch (error) {
    return c.json({ error: `Failed to update expert information - ${getErrorMessage(error)}` }, 500)
  }
}

export async function deleteExpert(c: C, expertId: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { id: true, userId: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    await prisma.expert.update({
      where: { id: expertId },
      data: { isDeleted: true },
    })

    return c.json({ success: true, message: 'Expert deleted successfully' })
  } catch (error) {
    return c.json({ error: `Failed to delete expert - ${getErrorMessage(error)}` }, 500)
  }
}

export async function getExpertAvailability(c: C, expertId: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    const availability = await prisma.expertAvailability.findMany({
      where: { expertId: expertId, isActive: true },
      select: {
        id: true,
        dayOfTheWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
      },
    })

    const days = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const dayAvailability = availability.filter((a) => a.dayOfTheWeek === DAY_MAP[dayIndex])

      const ranges = dayAvailability.map((a) => ({
        startMinutes: dateToMinutes(a.startTime),
        endMinutes: dateToMinutes(a.endTime),
      }))

      return {
        dayIndex,
        ranges,
      }
    })

    const blockedDates = await prisma.expertBlockDates.findMany({
      where: { expertId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
      },
    })

    return c.json({ days, blockedDates })
  } catch {
    return c.json({ error: `Failed to fetch availability` }, 500)
  }
}

export async function updateExpertAvailability(c: C, expertId: string, input: UpdateAvailabilityInput) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    await prisma.expertAvailability.deleteMany({
      where: { expertId: expertId },
    })

    const availabilityRecords = input.days.flatMap((day) =>
      day.ranges.map((range) => {
        const startTime = dayjs().startOf('day').add(range.startMinutes, 'minutes').utc().toDate()
        const endTime = dayjs().startOf('day').add(range.endMinutes, 'minutes').utc().toDate()

        return {
          expertId: expertId,
          dayOfTheWeek: DAY_MAP[day.dayIndex],
          startTime,
          endTime,
          isActive: true,
        }
      }),
    )

    await prisma.expertAvailability.createMany({
      data: availabilityRecords,
    })

    return c.json({ success: true })
  } catch {
    return c.json({ error: `Failed to update availability` }, 500)
  }
}

export async function bulkCreateBlockedDates(c: C, expertId: string, input: BulkCreateBlockedDatesInput) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert profile not found' }, 404)
    }

    for (const date of input.dates) {
      if (date.startDate >= date.endDate) {
        return c.json({ error: 'Start date must be before end date for all entries' }, 400)
      }
    }

    const result = await prisma.expertBlockDates.createMany({
      data: input.dates.map((d) => ({
        expertId,
        startDate: d.startDate,
        endDate: d.endDate,
      })),
    })

    return c.json({ success: true, count: result.count })
  } catch {
    return c.json({ error: `Failed to create blocked dates` }, 500)
  }
}

export async function deleteBlockedDate(c: C, blockedDateId: string) {
  try {
    const blockedDate = await prisma.expertBlockDates.findUnique({
      where: { id: blockedDateId },
    })

    if (!blockedDate) {
      return c.json({ error: 'Blocked date not found' }, 404)
    }

    await prisma.expertBlockDates.delete({
      where: { id: blockedDateId },
    })

    return c.json({ success: true })
  } catch {
    return c.json({ error: `Failed to delete blocked date` }, 500)
  }
}

function generateExpertSlug(name: string) {
  const formattedName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const id = nanoid(4)

  return `${formattedName}-${id}`
}

export async function getExpertServices(c: C, expertId: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    const services = await prisma.service.findMany({
      where: {
        expertId: expertId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    })

    return c.json({ services })
  } catch {
    return c.json({ error: 'Failed to fetch services' }, 500)
  }
}

export async function createServiceForExpert(c: C, expertId: string, input: CreateServiceForExpertInput) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      select: { id: true },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    const existingService = await prisma.service.findFirst({
      where: {
        expertId: expertId,
        slug: input.slug,
      },
    })

    if (existingService) {
      return c.json({ error: 'A service with this slug already exists for this expert' }, 400)
    }

    const service = await prisma.service.create({
      data: {
        expertId: expertId,
        name: input.name,
        slug: input.slug,
        availableModes: input.availableModes,
        paymentMode: input.paymentMode,
        inPersonLocation: input.inPersonLocation,
        city: input.city,
        country: input.country,
        description: input.description,
        bufferTimeBeforeInMinutes: input.bufferTimeBeforeInMinutes,
        bufferTimeAfterInMinutes: input.bufferTimeAfterInMinutes,
        price: input.price,
        currency: input.currency,
        isPartialPaymentAvailable: input.isPartialPaymentAvailable,
        minPaymentAmount: input.minPaymentAmount,
        durationInMinutes: input.durationInMinutes,
        tags: input.tags,
      },
    })

    return c.json({ success: true, service })
  } catch {
    return c.json({ error: `Failed to create service` }, 500)
  }
}

export async function getServiceDetails(c: C, serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        expert: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }

    return c.json({ service })
  } catch {
    return c.json({ error: 'Failed to fetch service details' }, 500)
  }
}

export async function updateServiceForExpert(c: C, serviceId: string, input: UpdateServiceForExpertInput) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, expertId: true, slug: true },
    })

    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }

    if (input.slug && input.slug !== service.slug) {
      const existingService = await prisma.service.findUnique({
        where: {
          expertId_slug: {
            expertId: service.expertId,
            slug: input.slug,
          },
        },
      })

      if (existingService) {
        return c.json({ error: 'A service with this slug already exists for this expert' }, 400)
      }
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.availableModes !== undefined && { availableModes: input.availableModes }),
        ...(input.paymentMode !== undefined && { paymentMode: input.paymentMode }),
        ...(input.inPersonLocation !== undefined && { inPersonLocation: input.inPersonLocation }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.bufferTimeBeforeInMinutes !== undefined && {
          bufferTimeBeforeInMinutes: input.bufferTimeBeforeInMinutes,
        }),
        ...(input.bufferTimeAfterInMinutes !== undefined && {
          bufferTimeAfterInMinutes: input.bufferTimeAfterInMinutes,
        }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.currency !== undefined && { currency: input.currency }),
        ...(input.isPartialPaymentAvailable !== undefined && {
          isPartialPaymentAvailable: input.isPartialPaymentAvailable,
        }),
        ...(input.minPaymentAmount !== undefined && { minPaymentAmount: input.minPaymentAmount }),
        ...(input.durationInMinutes !== undefined && { durationInMinutes: input.durationInMinutes }),
        ...(input.tags !== undefined && { tags: input.tags }),
      },
    })

    return c.json({ success: true, service: updatedService })
  } catch {
    return c.json({ error: `Failed to update service` }, 500)
  }
}

export async function deleteServiceForExpert(c: C, serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true },
    })

    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }

    const activeBookings = await prisma.booking.findFirst({
      where: {
        serviceId: serviceId,
        status: {
          in: ['BOOKED', 'DRAFT'],
        },
      },
    })

    if (activeBookings) {
      return c.json({ error: 'Cannot delete service with active bookings' }, 400)
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { isDeleted: true },
    })

    return c.json({ success: true, message: 'Service deleted successfully' })
  } catch {
    return c.json({ error: `Failed to delete service` }, 500)
  }
}

export async function reorderExpert(c: C, input: ReorderExpertsInput) {
  try {
    const { activeId, prevId, nextId } = input

    const prevExpert = prevId
      ? await prisma.expert.findFirst({
          where: { id: prevId },
          select: { order: true },
        })
      : null

    if (prevId && !prevExpert) {
      return c.json({ error: 'Previous expert not found' }, 404)
    }

    const nextExpert = nextId
      ? await prisma.expert.findFirst({
          where: { id: nextId },
          select: { order: true },
        })
      : null

    if (nextId && !nextExpert) {
      return c.json({ error: 'Next expert not found' }, 404)
    }

    const newOrder = generateKeyBetween(prevExpert?.order, nextExpert?.order)

    await prisma.expert.update({
      where: { id: activeId },
      data: { order: newOrder },
    })

    return c.json({ success: true, message: 'Expert reordered successfully' })
  } catch {
    return c.json({ error: `Failed to reorder expert` }, 500)
  }
}
