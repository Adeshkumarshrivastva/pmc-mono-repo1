import { nanoid } from 'nanoid'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import dayjs from '../../lib/dayjs'
import type {
  CreateExpertInput,
  UpdateExpertInfoInput,
  UpdateAvailabilityInput,
  BulkCreateBlockedDatesInput,
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
        where: { status: 'COMPLETED' },
        _sum: { amountPaid: true },
      }),
      prisma.booking.count({
        where: {
          OR: [
            { startDateTime: { gte: now } },
            {
              startDateTime: { lt: now },
              endDateTime: { gt: now },
            },
          ],
        },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        include: {
          expert: { include: { user: true } },
          patient: { include: { user: true } },
          service: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.expert.findMany({
        where: { isDeleted: false },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.patient.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
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
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          ...(input.phoneNumber ? [{ phoneNumber: input.phoneNumber }] : []),
        ],
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: nanoid(),
          email: input.email,
          phoneNumber: input.phoneNumber,
          name: input.name,
          role: 'EXPERT',
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'EXPERT' },
      })
    }

    const expert = await prisma.expert.create({
      data: {
        userId: user.id,
        name: input.name,
        slug: generateExpertSlug(input.name),
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
      },
    })

    return c.json({ success: true, expert })
  } catch (error) {
    return c.json(
      { error: `Failed to create expert - ${getErrorMessage(error)}` },
      500,
    )
  }
}

export async function getExpertDetails(c: C, expertId: string) {
  const expert = await prisma.expert.findUnique({
    where: { id: expertId },
    include: { user: true },
  })

  if (!expert) {
    return c.json({ error: 'Expert not found' }, 404)
  }

  return c.json(expert)
}

export async function updateExpertInfo(
  c: C,
  expertId: string,
  input: UpdateExpertInfoInput,
) {
  await prisma.expert.update({
    where: { id: expertId },
    data: input,
  })

  return c.json({ success: true })
}

export async function deleteExpert(c: C, expertId: string) {
  await prisma.expert.update({
    where: { id: expertId },
    data: { isDeleted: true },
  })

  return c.json({ success: true })
}

export async function getExpertAvailability(c: C, expertId: string) {
  const availability = await prisma.expertAvailability.findMany({
    where: { expertId },
  })

  const days = Array.from({ length: 7 }, (_, dayIndex) => ({
    dayIndex,
    ranges: availability
      .filter((a) => a.dayOfTheWeek === DAY_MAP[dayIndex])
      .map((a) => ({
        startMinutes: dateToMinutes(a.startTime),
        endMinutes: dateToMinutes(a.endTime),
      })),
  }))

  const blockedDates = await prisma.expertBlockDates.findMany({
    where: { expertId },
    select: { id: true, startDate: true, endDate: true },
  })

  return c.json({ days, blockedDates })
}

export async function updateExpertAvailability(
  c: C,
  expertId: string,
  input: UpdateAvailabilityInput,
) {
  await prisma.expertAvailability.deleteMany({ where: { expertId } })

  const records = input.days.flatMap((day) =>
    day.ranges.map((range) => ({
      expertId,
      dayOfTheWeek: DAY_MAP[day.dayIndex],
      startTime: dayjs()
        .startOf('day')
        .add(range.startMinutes, 'minute')
        .toDate(),
      endTime: dayjs()
        .startOf('day')
        .add(range.endMinutes, 'minute')
        .toDate(),
      isActive: true,
    })),
  )

  if (records.length) {
    await prisma.expertAvailability.createMany({ data: records })
  }

  return c.json({ success: true })
}

export async function bulkCreateBlockedDates(
  c: C,
  expertId: string,
  input: BulkCreateBlockedDatesInput,
) {
  const result = await prisma.expertBlockDates.createMany({
    data: input.dates.map((d) => ({
      expertId,
      startDate: d.startDate,
      endDate: d.endDate,
    })),
  })

  return c.json({ success: true, count: result.count })
}

export async function deleteBlockedDate(c: C, blockedDateId: string) {
  await prisma.expertBlockDates.delete({
    where: { id: blockedDateId },
  })

  return c.json({ success: true })
}


function generateExpertSlug(name: string) {
  return `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')}-${nanoid(4)}`
}
