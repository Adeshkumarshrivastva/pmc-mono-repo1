import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'

export async function getPayments(c: C) {
  const page = Number(c.req.query('page') || '1')
  const pageSize = Number(c.req.query('pageSize') || '10')
  const skip = (page - 1) * pageSize

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        expert: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        booking: {
          select: {
            patientName: true,
            startDateTime: true,
          },
        },
      },
    }),
    prisma.payment.count(),
  ])

  return c.json({
    data: payments,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}
