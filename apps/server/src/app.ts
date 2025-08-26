import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'
import { userApp } from './routes/user'
import { HonoContext } from './lib/context'

const app = new Hono<{ Variables: HonoContext }>()
  .basePath('/server')
  .use(
    cors({
      origin: ['http://localhost:5173'],
      credentials: true,
      exposeHeaders: ['Content-Length'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .get('/', (c) => {
    return c.json({ message: 'Hello World' })
  })
  .on(['POST', 'GET', 'OPTIONS'], '/auth/*', (c) => {
    return auth.handler(c.req.raw)
  })
  .use(async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    c.set('session', session.session)
    c.set('user', session.user)
    return next()
  })
  .route('/user', userApp)

export { app }
export type App = typeof app
