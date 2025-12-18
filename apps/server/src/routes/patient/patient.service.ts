import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'

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
