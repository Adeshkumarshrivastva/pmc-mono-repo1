import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { createServiceInput, updateServiceInput } from './services.input'
import { createService, updateService, deleteService, getService, getExpertServices } from './services.service'
import { authMiddleware, requirePermission } from '../../middleware/auth.middleware'

export const servicesApp = new Hono<{ Variables: HonoContext }>()

  .get('/', authMiddleware, async (c) => getExpertServices(c))
  .post('/', authMiddleware, requirePermission(['EXPERT']), zValidator('json', createServiceInput), async (c) =>
    createService(c, c.req.valid('json')),
  )
  .get('/:serviceId', async (c) => getService(c, { serviceId: c.req.param('serviceId') }))
  .patch(
    '/:serviceId',
    authMiddleware,
    requirePermission(['EXPERT']),
    zValidator('json', updateServiceInput.omit({ serviceId: true })),
    async (c) => updateService(c, { ...c.req.valid('json'), serviceId: c.req.param('serviceId') }),
  )
  .delete('/:serviceId', authMiddleware, requirePermission(['EXPERT']), async (c) =>
    deleteService(c, { serviceId: c.req.param('serviceId') }),
  )
