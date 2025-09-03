import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'
import { userApp } from './routes/user'
import { type HonoContext } from './lib/context'
import { config } from './config'
import { invariant } from './lib/utils'
import { expertApp } from './routes/experts/experts.routes'

invariant(config, 'config must be present')

const app = new Hono<{ Variables: HonoContext }>()
  .basePath('/server')
  .use(
    cors({
      origin: [config.cors.origin],
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
  .route('/expert', expertApp)
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
