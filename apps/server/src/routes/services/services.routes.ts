import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { createServiceInput, updateServiceInput } from './services.input'
import { createService, updateService, deleteService, getService, getExpertServices } from './services.service'
import { authMiddleware } from '../../middleware/auth.middleware'

export const servicesApp = new Hono<{ Variables: HonoContext }>()

  .get('/:serviceId', async (c) => getService(c, { serviceId: c.req.param('serviceId') }))

  .get('/', authMiddleware, async (c) => getExpertServices(c))
  .post('/', authMiddleware, zValidator('json', createServiceInput), async (c) => createService(c, c.req.valid('json')))
  .patch('/:serviceId', authMiddleware, zValidator('json', updateServiceInput.omit({ serviceId: true })), async (c) =>
    updateService(c, { ...c.req.valid('json'), serviceId: c.req.param('serviceId') }),
  )
  .delete('/:serviceId', authMiddleware, async (c) => deleteService(c, { serviceId: c.req.param('serviceId') }))

// import { Hono } from 'hono'
// import { zValidator } from '@hono/zod-validator'
// import { z } from 'zod'
// import type { HonoContext } from '../../lib/context'
// import { createServiceInput, updateServiceInput } from './services.input'
// import {
//   createService,
//   updateService,
//   deleteService,
//   getService,
//   getExpertServices,
//   getServicesByExpert,
// } from './services.service'
// import { authMiddleware } from '../../middleware/auth.middleware'

// const querySchema = z.object({
//   expertSlug: z.string().optional(),
// })

// export const servicesApp = new Hono<{ Variables: HonoContext }>()

//   // Public endpoint - get services (optionally filtered by expert slug)
//   .get('/', zValidator('query', querySchema), async (c) => {
//     const { expertSlug } = c.req.valid('query')

//     if (expertSlug) {
//       return getServicesByExpert(c, { expertSlug })
//     }

//     // If no expertSlug provided, return all services or handle as needed
//     return c.json({ services: [] })
//   })

//   // Get single service by ID
//   .get('/:serviceId', async (c) => getService(c, { serviceId: c.req.param('serviceId') }))

//   // Protected endpoints - require authentication
//   .post('/', authMiddleware, zValidator('json', createServiceInput), async (c) => createService(c, c.req.valid('json')))

//   .patch('/:serviceId', authMiddleware, zValidator('json', updateServiceInput.omit({ serviceId: true })), async (c) =>
//     updateService(c, { ...c.req.valid('json'), serviceId: c.req.param('serviceId') }),
//   )

//   .delete('/:serviceId', authMiddleware, async (c) => deleteService(c, { serviceId: c.req.param('serviceId') }))
