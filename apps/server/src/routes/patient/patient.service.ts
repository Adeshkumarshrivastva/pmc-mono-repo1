import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import type { Prisma } from '../../generated/prisma'
import dayjs from '../../lib/dayjs'
import type { PatientBookingsSearchQuery, SendTrialSessionEmailInput, UpdatePatientInput } from './patient.input'

export async function getPatients(c: C) {
  const page = Number(c.req.query('page') || '1')
  const pageSize = Number(c.req.query('pageSize') || '10')
  const skip = (page - 1) * pageSize

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
          },
        },
      },
    }),
    prisma.patient.count(),
  ])

  return c.json({ patients, total })
}

export async function getPatientByUserId(c: C) {
  const patient = await prisma.patient.findUnique({
    where: {
      userId: c.get('user')?.id,
    },
  })

  return c.json(patient)
}

export async function updatePatientByUserId(c: C, input: UpdatePatientInput) {
  const userId = c.get('user')?.id

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const patient = await prisma.patient.update({
    where: {
      userId,
    },
    data: {
      name: input.name,
      email: input.email || null,
      phoneNumber: input.phoneNumber,
      timezone: input.timezone,
    },
  })

  return c.json(patient)
}

export async function getPatientBookings(c: C, input: PatientBookingsSearchQuery) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const patient = await prisma.patient.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    if (!patient) {
      return c.json({ error: 'Patient profile not found' }, 404)
    }

    const bookingsWhereInput: Prisma.BookingWhereInput = {
      patientId: patient.id,
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
        expert: {
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

export async function getPatientDashboard(c: C) {
  try {
    const userId = c.var.user?.id
    if (!userId) {
      return c.json({ error: 'Missing userId' }, 400)
    }

    const patient = await prisma.patient.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        timezone: true,
      },
    })

    if (!patient) {
      return c.json({ error: 'Patient profile not found' }, 404)
    }

    const now = dayjs().toDate()

    const [totalBookings, upcomingBookings, completedBookings, recentBookings] = await Promise.all([
      prisma.booking.count({
        where: {
          patientId: patient.id,
        },
      }),
      prisma.booking.findMany({
        where: {
          patientId: patient.id,
          OR: [{ startDateTime: { gte: now } }, { startDateTime: { lt: now }, endDateTime: { gt: now } }],
        },
        include: {
          expert: {
            include: {
              user: true,
            },
          },
          service: true,
        },
        orderBy: { startDateTime: 'asc' },
        take: 3,
      }),
      prisma.booking.count({
        where: {
          patientId: patient.id,
          status: 'COMPLETED',
        },
      }),
      prisma.booking.findMany({
        where: {
          patientId: patient.id,
        },
        include: {
          expert: {
            include: {
              user: true,
            },
          },
          service: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return c.json({
      success: true,
      patient,
      stats: {
        totalBookings,
        upcomingBookingsCount: upcomingBookings.length,
        completedBookings,
      },
      upcomingBookings,
      recentBookings,
    })
  } catch {
    return c.json({ error: 'Failed to fetch dashboard data' }, 500)
  }
}

export async function sendTrialSessionEmail(c: C, input: SendTrialSessionEmailInput) {
  const { name, date, phoneNumber, email } = input
  const sessionDate = new Date(date)

  console.log('Trial Session Request:', {
    name,
    phoneNumber,
    email,
    sessionDate,
  })

  return c.json({
    message: true,
  })
}
