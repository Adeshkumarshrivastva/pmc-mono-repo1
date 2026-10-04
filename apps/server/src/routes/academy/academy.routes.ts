import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import { createCourseInput, listCoursesInput, updateCourseInput } from './academy.input'
import { createCourse, deleteCourse, getCourse, listCourses, updateCourse } from './academy.service'

/**
 * Academy — courses.
 *
 * Replaces `GET /api/courses/:type` from the standalone academy-demo backend.
 * Browsing stays open, as it was there: the catalogue is marketing, and a
 * visitor deciding whether to sign up has no account yet. Writes are new —
 * the demo had no way to create a course outside its seed script, so an
 * admin-only CRUD is what makes this catalogue maintainable once the demo
 * server is switched off.
 */
export const academyApp = new Hono<{ Variables: HonoContext }>()

  .get('/courses/:type', zValidator('param', listCoursesInput), async (c) =>
    listCourses(c, c.req.valid('param')),
  )
  .post(
    '/courses',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('json', createCourseInput),
    async (c) => createCourse(c, c.req.valid('json')),
  )
  .get('/course/:courseId', async (c) => getCourse(c, { courseId: c.req.param('courseId') }))
  .patch(
    '/course/:courseId',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('json', updateCourseInput),
    async (c) => updateCourse(c, { ...c.req.valid('json'), courseId: c.req.param('courseId') }),
  )
  .delete('/course/:courseId', authMiddleware, requirePermission(['ADMIN']), async (c) =>
    deleteCourse(c, { courseId: c.req.param('courseId') }),
  )
