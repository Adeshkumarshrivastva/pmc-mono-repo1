import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import type { HonoContext } from '../../lib/context'
import { uploadFile, getFile } from './file.service'
import { uploadFileInput } from './file.input'

export const fileApp = new Hono<{ Variables: HonoContext }>()
  .post('/upload', zValidator('form', uploadFileInput), async (c) => uploadFile(c, c.req.valid('form')))
  .get('/:filePath{.+}', async (c) => getFile(c))
