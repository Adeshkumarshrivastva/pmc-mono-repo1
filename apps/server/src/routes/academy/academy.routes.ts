import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import { resolveAcademyIdentity } from './academy.identity'
import { createCourseInput, listCoursesInput, updateCourseInput } from './academy.input'
import { createCourse, deleteCourse, getCourse, listCourses, updateCourse } from './academy.service'
import { materialIdInput, uploadMaterialInput } from './materials.input'
import { deleteMaterial, downloadMaterial, getMaterialAccess, listMaterials, uploadMaterial } from './materials.service'
import { createPurchaseOrderInput } from './purchases.input'
import { allPurchases, createPurchaseOrder, myPurchases, purchaseStats } from './purchases.service'
import { courseGroupInput, finalAssessmentSubmitInput, quizAnswersInput } from './quiz.input'
import {
  getCourseCertificate,
  getCourseStatus,
  getFinalAssessmentQuestions,
  getMaterialCertificate,
  getQuizQuestions,
  myCertificates,
  submitFinalAssessment,
  submitQuiz,
} from './quiz.service'
import { enrollInput, enrollmentIdInput, updateProgressInput } from './enrollments.input'
import { enroll, enrollmentStats, myEnrollments, updateProgress } from './enrollments.service'

/**
 * Academy — the standalone academy-demo backend (Express + Mongoose, its own
 * MongoDB) ported in full onto this server's own database: courses,
 * paid materials, purchases (now via a real Razorpay order instead of the
 * demo's trust-based "I've Paid" QR — see purchases.service.ts), quizzes and
 * certificates, and enrollments.
 */
export const academyApp = new Hono<{ Variables: HonoContext }>()

  // --- Courses — browsing stays open (the catalogue is marketing); writes
  // are admin-only. Replaces `GET /api/courses/:type`. ---
  .get('/courses/:type', zValidator('param', listCoursesInput), async (c) => listCourses(c, c.req.valid('param')))
  .post('/courses', authMiddleware, requirePermission(['ADMIN']), zValidator('json', createCourseInput), async (c) =>
    createCourse(c, c.req.valid('json')),
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

  // --- Enrollments — identity-based like purchases/quiz below (replaces
  // the demo's JWT-protected `/api/enrollments/*`), not authMiddleware: the
  // old academy app's logged-in-via-its-own-JWT users proxy in here under
  // their migrated `legacy:<id>` identity (see academy.identity.ts) and have
  // no better-auth account, so a hard `authMiddleware` requirement would
  // lock them out of enrolling entirely. ---
  .get('/enrollments/stats', resolveAcademyIdentity, async (c) => enrollmentStats(c))
  .get('/enrollments/me', resolveAcademyIdentity, async (c) => myEnrollments(c))
  .post('/enrollments', resolveAcademyIdentity, zValidator('json', enrollInput), async (c) =>
    enroll(c, c.req.valid('json')),
  )
  .patch(
    '/enrollments/:enrollmentId/progress',
    resolveAcademyIdentity,
    zValidator('json', updateProgressInput),
    async (c) =>
      updateProgress(c, {
        ...c.req.valid('json'),
        ...enrollmentIdInput.parse({ enrollmentId: c.req.param('enrollmentId') }),
      }),
  )

  // --- Materials — browsing is open; buying/quizzing works with or without
  // an account via resolveAcademyIdentity (`user:<id>` / `guest:<uuid>`).
  // Upload/delete are admin-only. ---
  .get('/materials', async (c) => listMaterials(c))
  .post(
    '/materials',
    authMiddleware,
    requirePermission(['ADMIN']),
    zValidator('form', uploadMaterialInput),
    async (c) => uploadMaterial(c, c.req.valid('form')),
  )
  .get('/materials/:materialId/access', resolveAcademyIdentity, async (c) =>
    getMaterialAccess(c, materialIdInput.parse({ materialId: c.req.param('materialId') })),
  )
  .get('/materials/:materialId/download', resolveAcademyIdentity, async (c) =>
    downloadMaterial(c, materialIdInput.parse({ materialId: c.req.param('materialId') })),
  )
  .delete('/materials/:materialId', authMiddleware, requirePermission(['ADMIN']), async (c) =>
    deleteMaterial(c, materialIdInput.parse({ materialId: c.req.param('materialId') })),
  )

  // --- Purchases — raises a real Razorpay order; the webhook in
  // webhooks.routes.ts confirms it. ---
  .post('/purchases', resolveAcademyIdentity, zValidator('json', createPurchaseOrderInput), async (c) =>
    createPurchaseOrder(c, c.req.valid('json')),
  )
  .get('/purchases/me', resolveAcademyIdentity, async (c) => myPurchases(c))
  .get('/purchases', authMiddleware, requirePermission(['ADMIN']), async (c) => allPurchases(c))
  .get('/purchases/stats', authMiddleware, requirePermission(['ADMIN']), async (c) => purchaseStats(c))

  // --- Per-material quiz + certificate. ---
  .get('/quiz/:materialId/questions', resolveAcademyIdentity, async (c) =>
    getQuizQuestions(c, materialIdInput.parse({ materialId: c.req.param('materialId') })),
  )
  .post(
    '/quiz/:materialId/submit',
    resolveAcademyIdentity,
    zValidator('json', quizAnswersInput),
    async (c) =>
      submitQuiz(c, { ...c.req.valid('json'), ...materialIdInput.parse({ materialId: c.req.param('materialId') }) }),
  )
  .get('/quiz/:materialId/certificate', resolveAcademyIdentity, async (c) =>
    getMaterialCertificate(c, materialIdInput.parse({ materialId: c.req.param('materialId') })),
  )
  .get('/certificates/me', resolveAcademyIdentity, async (c) => myCertificates(c))

  // --- Sequential-course bundle (e.g. "clinical-intake"): per-part status,
  // the final combined assessment, and the one whole-course certificate. ---
  .get('/course-bundle/:courseGroup/status', resolveAcademyIdentity, async (c) =>
    getCourseStatus(c, courseGroupInput.parse({ courseGroup: c.req.param('courseGroup') })),
  )
  .get('/course-bundle/:courseGroup/final', resolveAcademyIdentity, async (c) =>
    getFinalAssessmentQuestions(c, courseGroupInput.parse({ courseGroup: c.req.param('courseGroup') })),
  )
  .post(
    '/course-bundle/:courseGroup/final/submit',
    resolveAcademyIdentity,
    zValidator('json', finalAssessmentSubmitInput),
    async (c) =>
      submitFinalAssessment(c, {
        ...c.req.valid('json'),
        ...courseGroupInput.parse({ courseGroup: c.req.param('courseGroup') }),
      }),
  )
  .get('/course-bundle/:courseGroup/certificate', resolveAcademyIdentity, async (c) =>
    getCourseCertificate(c, courseGroupInput.parse({ courseGroup: c.req.param('courseGroup') })),
  )
