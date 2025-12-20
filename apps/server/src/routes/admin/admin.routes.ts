import { Hono } from 'hono'
import type { HonoContext } from '../../lib/context'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'
import { getAdminDashboard } from './admin.service'

export const adminApp = new Hono<{ Variables: HonoContext }>().get(
  '/dashboard',
  authMiddleware,
  requirePermission(['ADMIN']),
  (c) => getAdminDashboard(c),
)
