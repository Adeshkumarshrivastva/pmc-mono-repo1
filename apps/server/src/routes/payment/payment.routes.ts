import { Hono } from 'hono'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import { getPayments } from './payment.service'

export const paymentApp = new Hono<{ Variables: HonoContext }>().get(
  '/payments',
  authMiddleware,
  requirePermission(['ADMIN']),
  (c) => getPayments(c),
)
