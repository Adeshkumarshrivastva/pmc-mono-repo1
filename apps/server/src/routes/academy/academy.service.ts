import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import type { AcademyCourse } from '../../generated/prisma'
import {
  COURSE_LEVEL_BY_LABEL,
  COURSE_LEVEL_LABEL,
  COURSE_TYPE_BY_SLUG,
  SLUG_BY_COURSE_TYPE,
  type CreateCourseInput,
  type GetCourseInput,
  type ListCoursesInput,
  type UpdateCourseInput,
} from './academy.input'

/**
 * A course as the client sees it: slug for the kind, label for the level, and
 * `id` where Mongoose put `_id`.
 *
 * The demo returned raw Mongoose documents, so its frontend reads `_id`. That
 * spelling is not carried over — every other route in this server returns
 * `id`, and one collection answering `_id` would be a trap for the next
 * person. It is the one deliberate break in the response shape.
 */
function toClientCourse(course: AcademyCourse) {
  return {
    id: course.id,
    type: SLUG_BY_COURSE_TYPE[course.type],
    emoji: course.emoji,
    title: course.title,
    desc: course.desc,
    duration: course.duration,
    students: course.students,
    rating: course.rating,
    price: course.price,
    oldPrice: course.oldPrice,
    level: COURSE_LEVEL_LABEL[course.level],
    isActive: course.isActive,
    createdAt: course.createdAt,
  }
}

/** Live courses of one kind, oldest first — same order the demo listed them. */
export async function listCourses(c: C, input: ListCoursesInput) {
  try {
    const courses = await prisma.academyCourse.findMany({
      where: { type: COURSE_TYPE_BY_SLUG[input.type], isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    return c.json({ courses: courses.map(toClientCourse) })
  } catch (error) {
    return c.json({ error: `Failed to fetch courses - ${getErrorMessage(error)}` }, 500)
  }
}

export async function getCourse(c: C, input: GetCourseInput) {
  try {
    const course = await prisma.academyCourse.findUnique({
      where: { id: input.courseId },
    })

    if (!course || !course.isActive) {
      return c.json({ error: 'Course not found' }, 404)
    }

    return c.json({ course: toClientCourse(course) })
  } catch (error) {
    return c.json({ error: `Failed to fetch course - ${getErrorMessage(error)}` }, 500)
  }
}

export async function createCourse(c: C, input: CreateCourseInput) {
  try {
    const course = await prisma.academyCourse.create({
      data: {
        ...input,
        type: COURSE_TYPE_BY_SLUG[input.type],
        level: COURSE_LEVEL_BY_LABEL[input.level],
      },
    })

    return c.json({ success: true, course: toClientCourse(course) })
  } catch (error) {
    return c.json({ error: `Failed to create course - ${getErrorMessage(error)}` }, 500)
  }
}

export async function updateCourse(c: C, input: UpdateCourseInput & GetCourseInput) {
  try {
    const { courseId, type, level, ...rest } = input

    const existing = await prisma.academyCourse.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!existing) {
      return c.json({ error: 'Course not found' }, 404)
    }

    const course = await prisma.academyCourse.update({
      where: { id: courseId },
      data: {
        ...rest,
        // Absent means "leave it", which is not the same as null — spreading
        // an undefined enum through Prisma is a no-op, but writing it out
        // makes that intentional rather than incidental.
        ...(type ? { type: COURSE_TYPE_BY_SLUG[type] } : {}),
        ...(level ? { level: COURSE_LEVEL_BY_LABEL[level] } : {}),
      },
    })

    return c.json({ success: true, course: toClientCourse(course) })
  } catch (error) {
    return c.json({ error: `Failed to update course - ${getErrorMessage(error)}` }, 500)
  }
}

/**
 * Retires a course instead of deleting it.
 *
 * Enrollments point at a course id and carry its title for display; a hard
 * delete would leave a learner's dashboard referring to a row that is gone.
 * `isActive: false` takes it out of every listing, which is what "delete"
 * means to the admin pressing the button.
 */
export async function deleteCourse(c: C, input: GetCourseInput) {
  try {
    const existing = await prisma.academyCourse.findUnique({
      where: { id: input.courseId },
      select: { id: true },
    })

    if (!existing) {
      return c.json({ error: 'Course not found' }, 404)
    }

    await prisma.academyCourse.update({
      where: { id: input.courseId },
      data: { isActive: false },
    })

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: `Failed to delete course - ${getErrorMessage(error)}` }, 500)
  }
}
