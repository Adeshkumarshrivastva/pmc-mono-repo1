import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'
import { userApp } from './routes/user'
import { type HonoContext } from './lib/context'
import { config } from './config'
import { invariant } from './lib/utils'
import { expertsApp } from './routes/experts/experts.routes'
import { verificationApp } from './routes/verification/verification.routes'
import { bookingApp } from './routes/booking/booking.routes'
import { webhooksApp } from './routes/webhooks/webhooks.routes'

invariant(config, 'config must be present')

const app = new Hono<{ Variables: HonoContext }>()
  .basePath('/server')
  .use(
    cors({
      origin: [config.cors.origin],
      credentials: true,
      exposeHeaders: ['Content-Length'],
      allowMethods: ['POST', 'GET', 'PATCH', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .get('/', (c) => {
    return c.json({ message: 'Hello World' })
  })
  .on(['POST', 'GET', 'OPTIONS'], '/auth/*', (c) => {
    return auth.handler(c.req.raw)
  })
  .route('/experts', expertsApp)
  .route('/verification', verificationApp)
  .route('/webhooks', webhooksApp)
  .route('/user', userApp)
  .route('/booking', bookingApp)

export { app }
export type App = typeof app
