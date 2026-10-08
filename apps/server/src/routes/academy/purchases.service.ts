import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { razorpayInstance } from '../../lib/razorpay'
import { getErrorMessage } from '../../lib/utils'
import type { CreatePurchaseOrderInput } from './purchases.input'

/**
 * Raises a real Razorpay order to unlock one material. Confirmation (and
 * the actual `status: 'PAID'` flip) happens in
 * webhooks.service.ts#academyPurchaseConfirmation once Razorpay calls back —
 * this only ever creates a PENDING purchase.
 *
 * Replaces the academy-demo's `POST /api/payment/confirm`, which trusted the
 * client's own "I've Paid" tap against a static UPI QR code with no gateway
 * callback to verify against. That was a confirmed, deliberate shortcut for
 * the demo; this server already runs real Razorpay orders for bookings, so
 * materials get the same real confirmation instead of carrying the shortcut
 * forward.
 */
export async function createPurchaseOrder(c: C, input: CreatePurchaseOrderInput) {
  try {
    const identity = c.get('academyIdentity')!
    const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId } })
    if (!material) return c.json({ error: 'Material not found' }, 404)

    // Part 2+ of a sequential course (price: 0) is earned via the previous
    // part's quiz, never paid for — reject rather than silently charging
    // `material.price || 99` below, which would happen since 0 is falsy.
    if (material.courseGroup && material.order !== null && material.order > 1) {
      return c.json({ error: 'This part is unlocked by quiz, not payment' }, 400)
    }

    const alreadyPaid = await prisma.purchase.findFirst({
      where: { identity, materialId: material.id, status: 'PAID' },
    })
    if (alreadyPaid) return c.json({ error: 'Already purchased' }, 409)

    const amount = material.price || 99

    const purchase = await prisma.purchase.create({
      data: {
        identity,
        materialId: material.id,
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        reason: input.reason,
        amount,
        status: 'PENDING',
      },
    })

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: 'INR',
      notes: {
        kind: 'academy_material_purchase',
        purchaseId: purchase.id,
        materialId: material.id,
      },
    })

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { razorpayOrderId: razorpayOrder.id },
    })

    return c.json({ success: true, purchaseId: purchase.id, razorpayOrder })
  } catch (error) {
    return c.json({ error: `Failed to start purchase - ${getErrorMessage(error)}` }, 500)
  }
}

/** The current visitor's own purchase history. */
export async function myPurchases(c: C) {
  const identity = c.get('academyIdentity')!
  const purchases = await prisma.purchase.findMany({
    where: { identity, status: 'PAID' },
    include: { material: { select: { title: true } } },
    orderBy: { paidAt: 'desc' },
  })

  return c.json({
    purchases: purchases.map((p) => ({
      id: p.id,
      materialId: p.materialId,
      materialTitle: p.material.title,
      amount: p.amount,
      paidAt: p.paidAt,
    })),
  })
}

/** Admin-only: every buyer's details, for follow-up. */
export async function allPurchases(c: C) {
  const purchases = await prisma.purchase.findMany({
    where: { status: 'PAID' },
    include: { material: { select: { title: true } } },
    orderBy: { paidAt: 'desc' },
    take: 200,
  })

  return c.json({
    purchases: purchases.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      reason: p.reason,
      materialTitle: p.material.title,
      amount: p.amount,
      paidAt: p.paidAt,
    })),
  })
}

/** Admin-only: quick dashboard numbers. */
export async function purchaseStats(c: C) {
  const [materials, paidPurchases, revenue, certificates] = await Promise.all([
    prisma.courseMaterial.count(),
    prisma.purchase.count({ where: { status: 'PAID' } }),
    prisma.purchase.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.quizAttempt.count({ where: { passed: true } }),
  ])

  return c.json({
    materials,
    purchases: paidPurchases,
    revenue: revenue._sum.amount || 0,
    certificates,
  })
}
