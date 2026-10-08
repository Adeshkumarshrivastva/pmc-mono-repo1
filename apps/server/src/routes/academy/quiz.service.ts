import { randomBytes } from 'node:crypto'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import { generateCertificatePDF } from '../../lib/certificate'
import {
  getFinalAssessment,
  getPartQuestions,
  LEGACY_PASS_MARK,
  LEGACY_QUIZ_QUESTIONS,
  type QuizQuestion,
} from '../../lib/academy-quiz-data'
import { hasAccess } from './academy.access'
import type { MaterialIdInput } from './materials.input'
import type { CourseGroupInput, FinalAssessmentSubmitInput, QuizAnswersInput } from './quiz.input'
import type { CourseMaterial } from '../../generated/prisma'

function formatCertDate(date: Date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * Materials belonging to a sequential courseGroup get their own per-part
 * question set from academy-quiz-data.ts. Anything else uses the single
 * shared legacy bank — same split as the academy-demo.
 */
function questionsForMaterial(material: CourseMaterial): { questions: QuizQuestion[]; passMark: number } {
  if (material.courseGroup && material.order) {
    const partQuestions = getPartQuestions(material.courseGroup, material.order)
    if (partQuestions) return { questions: partQuestions, passMark: Math.ceil(partQuestions.length * 0.5) }
  }
  return { questions: LEGACY_QUIZ_QUESTIONS, passMark: LEGACY_PASS_MARK }
}

async function requireMaterialAccess(c: C, materialId: string) {
  const material = await prisma.courseMaterial.findUnique({ where: { id: materialId } })
  if (!material) return { error: c.json({ error: 'Course material not found' }, 404) } as const

  const identity = c.get('academyIdentity')!
  const ok = await hasAccess(identity, material)
  if (!ok) {
    const message =
      material.courseGroup && material.order !== null && material.order > 1
        ? "Complete the previous part's quiz first to unlock this one"
        : 'Please purchase the course material first'
    return { error: c.json({ error: message }, 403) } as const
  }
  return { material, identity } as const
}

export async function getQuizQuestions(c: C, input: MaterialIdInput) {
  const result = await requireMaterialAccess(c, input.materialId)
  if ('error' in result) return result.error

  const { questions, passMark } = questionsForMaterial(result.material)
  return c.json({
    questions: questions.map(({ id, question, options }) => ({ id, question, options })),
    passMark,
    total: questions.length,
  })
}

export async function submitQuiz(c: C, input: MaterialIdInput & QuizAnswersInput) {
  try {
    const result = await requireMaterialAccess(c, input.materialId)
    if ('error' in result) return result.error
    const { material, identity } = result

    const { questions, passMark } = questionsForMaterial(material)
    let score = 0
    for (const q of questions) {
      if (Number(input.answers[String(q.id)]) === q.correctIndex) score += 1
    }
    const total = questions.length
    const passed = score >= passMark

    await prisma.quizAttempt.create({ data: { identity, materialId: material.id, score, total, passed } })

    return c.json({ score, total, passed, passMark })
  } catch (error) {
    return c.json({ error: `Failed to submit quiz - ${getErrorMessage(error)}` }, 500)
  }
}

/** Per-material certificate — only for plain (non-grouped) materials. */
export async function getMaterialCertificate(c: C, input: MaterialIdInput) {
  try {
    const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId } })
    if (!material) return c.json({ error: 'Course material not found' }, 404)

    if (material.courseGroup) {
      return c.json({ error: 'This course issues one certificate after the final assessment, not per part.' }, 403)
    }

    const identity = c.get('academyIdentity')!
    const ok = await hasAccess(identity, material)
    if (!ok) return c.json({ error: 'Please purchase the course material first' }, 403)

    const attempt = await prisma.quizAttempt.findFirst({
      where: { identity, materialId: material.id, passed: true },
      orderBy: { createdAt: 'desc' },
    })
    if (!attempt) return c.json({ error: 'Pass the quiz to unlock your certificate' }, 403)

    let certificateId = attempt.certificateId
    if (!certificateId) {
      certificateId = randomBytes(8).toString('hex').toUpperCase()
      await prisma.quizAttempt.update({ where: { id: attempt.id }, data: { certificateId } })
    }

    const purchase = await prisma.purchase.findFirst({ where: { identity, materialId: material.id, status: 'PAID' } })

    const pdf = await generateCertificatePDF({
      name: purchase?.name || 'Learner',
      courseTitle: material.title,
      score: attempt.score,
      total: attempt.total,
      certificateId,
      date: formatCertDate(attempt.createdAt),
    })

    return c.body(pdf, 200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${certificateId}.pdf"`,
    })
  } catch (error) {
    return c.json({ error: `Failed to generate certificate - ${getErrorMessage(error)}` }, 500)
  }
}

/** The current visitor's earned per-material certificates. */
export async function myCertificates(c: C) {
  const identity = c.get('academyIdentity')!
  const attempts = await prisma.quizAttempt.findMany({
    where: { identity, passed: true },
    include: { material: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })

  // Keep only the latest passing attempt per material.
  const seen = new Set<string>()
  const certificates: Array<{
    materialId: string
    materialTitle: string
    score: number
    total: number
    certificateId: string | null
    attemptedAt: Date
  }> = []
  for (const attempt of attempts) {
    if (seen.has(attempt.materialId)) continue
    seen.add(attempt.materialId)
    certificates.push({
      materialId: attempt.materialId,
      materialTitle: attempt.material.title,
      score: attempt.score,
      total: attempt.total,
      certificateId: attempt.certificateId,
      attemptedAt: attempt.createdAt,
    })
  }
  return c.json({ certificates })
}

// ---------------------------------------------------------------------------
// Sequential-course bundle (e.g. "clinical-intake"): per-part status, the
// final combined assessment, and the one whole-course certificate it earns.
// ---------------------------------------------------------------------------

async function loadOrderedParts(courseGroup: string) {
  // Order 0 is a free intro/preview with no quiz of its own — excluded here
  // so it never counts against "every part passed".
  return prisma.courseMaterial.findMany({
    where: { courseGroup, order: { gte: 1 } },
    orderBy: { order: 'asc' },
  })
}

export async function getCourseStatus(c: C, input: CourseGroupInput) {
  try {
    const parts = await loadOrderedParts(input.courseGroup)
    if (parts.length === 0) return c.json({ error: 'Course not found' }, 404)

    const identity = c.get('academyIdentity')!
    const items = []
    for (const material of parts) {
      const unlocked = await hasAccess(identity, material)
      const lastAttempt = unlocked
        ? await prisma.quizAttempt.findFirst({
            where: { identity, materialId: material.id },
            orderBy: { createdAt: 'desc' },
          })
        : null
      // "Passed" must reflect any attempt ever, not just the latest one —
      // access is unlocked permanently on a first pass, so a later failed
      // retake can't be allowed to desync the UI from what access actually is.
      const everPassed = unlocked
        ? !!(await prisma.quizAttempt.findFirst({ where: { identity, materialId: material.id, passed: true } }))
        : false

      items.push({
        materialId: material.id,
        title: material.title,
        order: material.order,
        price: material.price,
        unlocked,
        quizPassed: everPassed,
        lastScore: lastAttempt ? { score: lastAttempt.score, total: lastAttempt.total } : null,
      })
    }

    const allPassed = items.every((i) => i.quizPassed)
    const certificate = await prisma.courseCertificate.findFirst({
      where: { identity, courseGroup: input.courseGroup, passed: true },
    })

    return c.json({ parts: items, allPassed, finalUnlocked: allPassed, certificateEarned: !!certificate })
  } catch (error) {
    return c.json({ error: `Failed to load course status - ${getErrorMessage(error)}` }, 500)
  }
}

async function requireAllPartsPassed(c: C, courseGroup: string) {
  const parts = await loadOrderedParts(courseGroup)
  if (parts.length === 0) return { error: c.json({ error: 'Course not found' }, 404) } as const

  const identity = c.get('academyIdentity')!
  for (const material of parts) {
    const attempt = await prisma.quizAttempt.findFirst({ where: { identity, materialId: material.id, passed: true } })
    if (!attempt) return { error: c.json({ error: `Finish and pass "${material.title}" first.` }, 403) } as const
  }
  return { identity } as const
}

export async function getFinalAssessmentQuestions(c: C, input: CourseGroupInput) {
  const result = await requireAllPartsPassed(c, input.courseGroup)
  if ('error' in result) return result.error

  const assessment = getFinalAssessment(input.courseGroup)
  if (!assessment) return c.json({ error: 'Final assessment not configured for this course' }, 404)

  return c.json({
    mcq: assessment.mcq.map(({ id, question, options }) => ({ id, question, options })),
    longAnswer: assessment.longAnswer,
    passMark: Math.ceil(assessment.mcq.length * 0.5),
    total: assessment.mcq.length,
  })
}

export async function submitFinalAssessment(c: C, input: CourseGroupInput & FinalAssessmentSubmitInput) {
  try {
    const result = await requireAllPartsPassed(c, input.courseGroup)
    if ('error' in result) return result.error
    const { identity } = result

    const assessment = getFinalAssessment(input.courseGroup)
    if (!assessment) return c.json({ error: 'Final assessment not configured for this course' }, 404)

    const longAnswerText = input.longAnswerText.trim()
    let score = 0
    for (const q of assessment.mcq) {
      if (Number(input.answers[String(q.id)]) === q.correctIndex) score += 1
    }
    const total = assessment.mcq.length
    const passMark = Math.ceil(total * 0.5)
    const passed = score >= passMark && longAnswerText.length > 0

    await prisma.courseCertificate.create({
      data: { identity, courseGroup: input.courseGroup, score, total, passed, longAnswer: longAnswerText },
    })

    return c.json({ score, total, passed, passMark, requiresLongAnswer: longAnswerText.length === 0 })
  } catch (error) {
    return c.json({ error: `Failed to submit final assessment - ${getErrorMessage(error)}` }, 500)
  }
}

export async function getCourseCertificate(c: C, input: CourseGroupInput) {
  try {
    const identity = c.get('academyIdentity')!
    const record = await prisma.courseCertificate.findFirst({
      where: { identity, courseGroup: input.courseGroup, passed: true },
      orderBy: { createdAt: 'desc' },
    })
    if (!record) return c.json({ error: 'Pass the final assessment to unlock your certificate' }, 403)

    let certificateId = record.certificateId
    if (!certificateId) {
      certificateId = randomBytes(8).toString('hex').toUpperCase()
      await prisma.courseCertificate.update({ where: { id: record.id }, data: { certificateId } })
    }

    const firstPart = await prisma.courseMaterial.findFirst({ where: { courseGroup: input.courseGroup, order: 1 } })
    const purchase = firstPart
      ? await prisma.purchase.findFirst({ where: { identity, materialId: firstPart.id, status: 'PAID' } })
      : null

    const pdf = await generateCertificatePDF({
      name: purchase?.name || 'Learner',
      courseTitle: firstPart ? firstPart.title.replace(/^PART\s*1\s*-\s*/i, '') : 'Course',
      score: record.score,
      total: record.total,
      certificateId,
      date: formatCertDate(record.createdAt),
    })

    return c.body(pdf, 200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${certificateId}.pdf"`,
    })
  } catch (error) {
    return c.json({ error: `Failed to generate certificate - ${getErrorMessage(error)}` }, 500)
  }
}
