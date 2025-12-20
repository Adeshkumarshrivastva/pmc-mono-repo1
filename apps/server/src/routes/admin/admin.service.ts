import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import dayjs from '../../lib/dayjs'

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
