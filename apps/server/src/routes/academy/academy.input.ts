import z from 'zod'
import { AcademyCourseLevel, AcademyCourseType } from '../../generated/prisma'

/**
 * The five course kinds as they appear in a URL.
 *
 * The demo served `/api/courses/:type` on exactly these slugs, and its web
 * client has them hardcoded in nav links and route params. Keeping them makes
 * this port a change of host rather than a change of contract — the enum
 * spelling stays the database's business and never reaches a client.
 */
const COURSE_TYPE_SLUGS = [
  'webinar',
  'online-course',
  'hybrid-course',
  'online-class',
  'offline-course',
] as const

export type CourseTypeSlug = (typeof COURSE_TYPE_SLUGS)[number]

export const courseTypeSlugSchema = z.enum(COURSE_TYPE_SLUGS)

export const COURSE_TYPE_BY_SLUG = {
  'webinar': AcademyCourseType.WEBINAR,
  'online-course': AcademyCourseType.ONLINE_COURSE,
  'hybrid-course': AcademyCourseType.HYBRID_COURSE,
  'online-class': AcademyCourseType.ONLINE_CLASS,
  'offline-course': AcademyCourseType.OFFLINE_COURSE,
} as const satisfies Record<CourseTypeSlug, AcademyCourseType>

export const SLUG_BY_COURSE_TYPE = Object.fromEntries(
  Object.entries(COURSE_TYPE_BY_SLUG).map(([slug, type]) => [type, slug]),
) as Record<AcademyCourseType, CourseTypeSlug>

/**
 * How a level is spelled to a client.
 *
 * Mongoose stored the label itself ("All Levels") because it had nowhere
 * better to put it. Here the label is presentation and the enum is storage,
 * so the two are separated — but the wire value is unchanged, since the demo
 * frontend prints `course.level` straight into a chip.
 */
export const COURSE_LEVEL_LABEL = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All Levels',
} as const satisfies Record<AcademyCourseLevel, string>

export type CourseLevelLabel = (typeof COURSE_LEVEL_LABEL)[AcademyCourseLevel]

export const COURSE_LEVEL_BY_LABEL = Object.fromEntries(
  Object.entries(COURSE_LEVEL_LABEL).map(([level, label]) => [label, level]),
) as Record<CourseLevelLabel, AcademyCourseLevel>

export const courseLevelLabelSchema = z.enum(
  Object.values(COURSE_LEVEL_LABEL) as [CourseLevelLabel, ...CourseLevelLabel[]],
)

export const listCoursesInput = z.object({
  type: courseTypeSlugSchema,
})

export const getCourseInput = z.object({
  courseId: z.string().min(1, 'Course id is required'),
})

export const createCourseInput = z.object({
  type: courseTypeSlugSchema,
  emoji: z.string().default(''),
  title: z.string().min(1, 'Title is required').trim(),
  desc: z.string().min(1, 'Description is required'),
  duration: z.string().min(1, 'Duration is required'),
  students: z.string().default('0 enrolled'),
  rating: z.string().default('0★'),
  price: z.string().min(1, 'Price is required'),
  oldPrice: z.string().default(''),
  level: courseLevelLabelSchema.default('All Levels'),
  isActive: z.boolean().default(true),
})

export const updateCourseInput = createCourseInput.partial()

export type ListCoursesInput = z.infer<typeof listCoursesInput>
export type GetCourseInput = z.infer<typeof getCourseInput>
export type CreateCourseInput = z.infer<typeof createCourseInput>
export type UpdateCourseInput = z.infer<typeof updateCourseInput>
