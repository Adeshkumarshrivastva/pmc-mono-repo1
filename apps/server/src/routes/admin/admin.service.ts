import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import dayjs from '../../lib/dayjs'
import type { UpdateExpertInfoInput, UpdateAvailabilityInput } from './admin.input'
import { DayOfWeek } from '../../generated/prisma'
import { dateToMinutes } from '../../lib/date'

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
      prisma.expert.count(),
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

export async function getExpertDetails(c: C, expertId: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { id: expertId },
      include: {
        user: true,
        servicesProvided: true,
        availability: true,
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
    const expert = await prisma.expert.update({
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

    return c.json({ success: true, expert })
  } catch {
    return c.json({ error: 'Failed to update expert information' }, 500)
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

    return c.json({ days })
  } catch {
    return c.json({ error: 'Failed to fetch availability' }, 500)
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
    return c.json({ error: 'Failed to update availability' }, 500)
  }
}
