import { prisma } from '../../lib/db'
import type { CourseMaterial } from '../../generated/prisma'

/**
 * Shared "can this identity see/download this material" check — used by the
 * materials, quiz and purchases services so the three can't drift apart.
 * Ported from the academy-demo's `utils/access.js`.
 *
 * - Order 0 of a group: free intro/preview — open to everyone, no payment or
 *   quiz needed.
 * - Order 1 of a group, or a plain (non-grouped) material: access = a PAID
 *   Purchase for this exact material.
 * - Grouped, order > 1 materials: access is earned, not paid for — granted
 *   once the identity has passed the quiz for the previous part in the same
 *   courseGroup.
 */
export async function hasAccess(identity: string, material: CourseMaterial): Promise<boolean> {
  if (material.courseGroup && material.order === 0) return true

  if (material.courseGroup && material.order !== null && material.order > 1) {
    const prev = await prisma.courseMaterial.findFirst({
      where: { courseGroup: material.courseGroup, order: material.order - 1 },
    })
    if (!prev) return false

    const prevAttempt = await prisma.quizAttempt.findFirst({
      where: { identity, materialId: prev.id, passed: true },
    })
    return !!prevAttempt
  }

  const purchase = await prisma.purchase.findFirst({
    where: { identity, materialId: material.id, status: 'PAID' },
  })
  return !!purchase
}
