import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import dayjs from '../../lib/dayjs'
import type { CreateBookingInput } from './booking.input'
import { DAY_MAP } from '../../lib/booking'
import { DayOfWeek } from '../../generated/prisma'
import { dateToMinutes } from '../../lib/date'
import { razorpayInstance } from '../../lib/razorpay'
import { handlePostBooking } from '../../lib/post-booking'

export async function createBooking(c: C, input: CreateBookingInput) {
  const userId = c.var.user?.id
  if (!userId) {
    return c.json({ error: 'Missing userId' }, 400)
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const expert = await prisma.expert.findUnique({
    where: {
      id: input.expertId,
    },
    select: {
      id: true,
      userId: true,
    },
  })

  if (!expert) {
    return c.json({ error: 'Expert not found' }, 404)
  }

  if (expert.userId === user.id) {
    return c.json({ error: 'Expert can not book their own service' }, 403)
  }

  const service = await prisma.service.findUnique({
    where: {
      id: input.serviceId,
    },
  })

  if (!service) {
    return c.json({ error: 'Service not found' }, 404)
  }

  if (service.expertId !== expert.id) {
    return c.json({ error: 'Service does not belong to the provided expert' }, 409)
  }

  let patient = await prisma.patient.findUnique({
    where: {
      userId: user.id,
    },
  })

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        userId: user.id,
      },
    })
  }

  const startDateTime = new Date(input.startDateTime)
  const endDateTime = dayjs(startDateTime).add(service.durationInMinutes, 'minutes').toDate()

  const slotCheck = await isSlotAvailable(expert.id, startDateTime, endDateTime)
  if (!slotCheck.isAvailable) {
    return c.json({ error: slotCheck.reason || 'Slot not available' }, 404)
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const draftBooking = await tx.booking.create({
        data: {
          status: 'DRAFT',
          startDateTime: input.startDateTime,
          endDateTime: endDateTime,
          expertId: expert.id,
          patientId: patient.id,
          patientName: input.patientName,
          patientEmail: input.patientEmail,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          serviceDurationInMinutes: service.durationInMinutes,
          serviceBufferTimeAfterInMinutes: service.bufferTimeAfterInMinutes,
          serviceBufferTimeBeforeInMinutes: service.bufferTimeBeforeInMinutes,
          serviceCurrency: service.currency,
          preBookingQnA: input.prebookingQnA,
          mode: input.mode,
          inPersonLocation: input.mode === 'IN_PERSON' ? service.inPersonLocation : null,
        },
      })

      const pendingPayment = await tx.payment.create({
        data: {
          status: 'PENDING',
          expertId: expert.id,
          patientId: patient.id,
          serviceId: service.id,
          serviceName: service.name,
          serviceCurrency: service.currency,
          servicePrice: service.price,
          bookingId: draftBooking.id,
          paymentMode: service.paymentMode,
          // TODO: Later, we will take the partial payment amount as input from the patient
          amountPaid: service.price,
          isPartialPayment: false,
          amountCurrency: 'INR',
        },
      })

      return { draftBooking, pendingPayment }
    })

    if (service.paymentMode === 'ONLINE') {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: result.pendingPayment.amountPaid * 100,
        currency: result.pendingPayment.serviceCurrency,
        notes: {
          bookingId: result.draftBooking.id,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          expertId: expert.id,
          patientId: patient.id,
          paymentId: result.pendingPayment.id,
          bookingMode: input.mode,
        },
      })

      await prisma.payment.update({
        where: {
          id: result.pendingPayment.id,
        },
        data: {
          razorpayOrderId: razorpayOrder.id,
        },
      })

      return c.json({
        success: true,
        bookingId: result.draftBooking.id,
        paymentMode: 'ONLINE' as const,
        razorpayOrder: razorpayOrder,
      })
    } else {
      const bookingWithRelations = await prisma.booking.findUnique({
        where: { id: result.draftBooking.id },
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
      })

      if (!bookingWithRelations) {
        return c.json({ error: 'Booking not found after creation' }, 500)
      }

      const { googleCalendarEvent } = await handlePostBooking({
        booking: bookingWithRelations,
        orderId: null, // No Razorpay order for offline payments
      })

      await prisma.booking.update({
        where: {
          id: result.draftBooking.id,
        },
        data: {
          status: 'BOOKED',
          virtualLocation:
            bookingWithRelations.mode === 'VIRTUAL' && googleCalendarEvent?.meetLink
              ? {
                  type: 'google_meet',
                  meetLink: googleCalendarEvent.meetLink,
                }
              : null,
          calendarEventId: googleCalendarEvent?.eventId ?? null,
        },
      })

      return c.json({
        success: true,
        bookingId: result.draftBooking.id,
        paymentMode: service.paymentMode,
        razorpayOrder: null,
      })
    }
  } catch {
    return c.json({ error: 'Failed to create booking' }, 500)
  }
}

export async function getAllBookings(c: C) {
  const page = Number(c.req.query('page') || '1')
  const pageSize = Number(c.req.query('pageSize') || '10')
  const period = c.req.query('period') || 'upcoming'
  const skip = (page - 1) * pageSize

  const now = new Date()
  const periodFilter =
    period === 'upcoming'
      ? {
          startDateTime: {
            gte: now,
          },
        }
      : {
          startDateTime: {
            lt: now,
          },
        }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: periodFilter,
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
        service: {
          select: {
            name: true,
            price: true,
            currency: true,
          },
        },
      },
    }),
    prisma.booking.count({
      where: periodFilter,
    }),
  ])

  return c.json({
    data: bookings,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}

async function isSlotAvailable(
  expertId: string,
  startDateTime: Date,
  endDateTime: Date,
): Promise<{ isAvailable: boolean; reason?: string }> {
  const now = dayjs().utc()

  const slotStart = dayjs(startDateTime)

  if (slotStart.isBefore(now)) {
    return { isAvailable: false, reason: 'Slot is in the past' }
  }

  const slotEnd = dayjs(endDateTime)

  const dayOfTheWeek = Object.keys(DAY_MAP).find((key) => DAY_MAP[key as DayOfWeek] === slotStart.day()) as DayOfWeek

  const weeklySchedule = await prisma.expertAvailability.findMany({
    where: {
      expertId,
      dayOfTheWeek,
      isActive: { not: false },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  if (weeklySchedule.length === 0) {
    return { isAvailable: false, reason: 'No availability on this day of the week' }
  }

  const slotStartMinutes = dateToMinutes(startDateTime)
  const slotEndMinutes = dateToMinutes(endDateTime)

  const fitsInSchedule = weeklySchedule.some((schedule) => {
    const scheduleStartMinutes = dateToMinutes(schedule.startTime)
    const scheduleEndMinutes = dateToMinutes(schedule.endTime)

    return slotStartMinutes >= scheduleStartMinutes && slotEndMinutes <= scheduleEndMinutes
  })

  if (!fitsInSchedule) {
    return { isAvailable: false, reason: 'Slot is outside of available hours' }
  }

  const blockDates = await prisma.expertBlockDates.findMany({
    where: {
      expertId: expertId,
      startDate: { lte: endDateTime },
      endDate: { gte: startDateTime },
    },
  })

  if (blockDates.length > 0) {
    return { isAvailable: false, reason: 'Date is blocked' }
  }

  const conflictingBookings = await prisma.booking.findMany({
    where: {
      expertId: expertId,
      status: { in: ['BOOKED', 'DRAFT'] },
      OR: [
        {
          // Booking starts during our slot
          startDateTime: {
            gte: slotStart.toDate(),
            lt: slotEnd.toDate(),
          },
        },
        {
          // Booking ends during our slot
          endDateTime: {
            gt: slotStart.toDate(),
            lte: slotEnd.toDate(),
          },
        },
        {
          // Booking completely overlaps our slot
          AND: [{ startDateTime: { lte: slotStart.toDate() } }, { endDateTime: { gte: slotEnd.toDate() } }],
        },
      ],
    },
    select: {
      id: true,
    },
  })

  if (conflictingBookings.length > 0) {
    return { isAvailable: false, reason: 'Slot conflicts with existing bookings' }
  }

  return { isAvailable: true }
}
