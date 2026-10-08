import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import type { EnrollInput, EnrollmentIdInput, UpdateProgressInput } from './enrollments.input'

/** Dashboard stats for the current visitor's own enrollments. */
export async function enrollmentStats(c: C) {
  const identity = c.get('academyIdentity')!
  const enrollments = await prisma.enrollment.findMany({ where: { userId: identity } })

  const total = enrollments.length
  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length
  const inProgress = enrollments.filter((e) => e.progress > 0 && e.status !== 'COMPLETED').length
  const avgProgress = total > 0 ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / total) : 0

  return c.json({ total, completed, inProgress, notStarted: total - completed - inProgress, avgProgress })
}

export async function myEnrollments(c: C) {
  const identity = c.get('academyIdentity')!
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: identity },
    orderBy: { enrolledAt: 'desc' },
  })
  return c.json({ enrollments })
}

export async function enroll(c: C, input: EnrollInput) {
  try {
    const identity = c.get('academyIdentity')!
    const course = await prisma.academyCourse.findUnique({ where: { id: input.courseId } })
    if (!course || !course.isActive) return c.json({ error: 'Course not found' }, 404)

    const existing = await prisma.enrollment.findFirst({ where: { userId: identity, courseId: course.id } })
    if (existing) return c.json({ error: 'Already enrolled in this course' }, 409)

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: identity,
        courseId: course.id,
        courseType: course.type,
        courseTitle: course.title,
        price: course.price,
      },
    })

    return c.json({ success: true, enrollment })
  } catch (error) {
    return c.json({ error: `Failed to enroll - ${getErrorMessage(error)}` }, 500)
  }
}

export async function updateProgress(c: C, input: UpdateProgressInput & EnrollmentIdInput) {
  try {
    const identity = c.get('academyIdentity')!
    const enrollment = await prisma.enrollment.findFirst({ where: { id: input.enrollmentId, userId: identity } })
    if (!enrollment) return c.json({ error: 'Enrollment not found' }, 404)

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: input.progress,
        lastAccessedAt: new Date(),
        status: input.progress >= 100 ? 'COMPLETED' : 'ACTIVE',
      },
    })

    return c.json({ success: true, enrollment: updated })
  } catch (error) {
    return c.json({ error: `Failed to update progress - ${getErrorMessage(error)}` }, 500)
  }
}
