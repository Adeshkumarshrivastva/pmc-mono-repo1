import { Hono } from 'hono'

const app = new Hono()
  .basePath('/api')
  .get('/', (c) => {
    return c.json({ message: 'Hello World' })
  })
  .get('test/:messageId', (c) => {
    return c.json({ message: c.req.param('messageId') })
  })

export { app }
