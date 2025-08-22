import { Context, Hono, Next } from 'hono'
import type { Session, User } from 'better-auth'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'

type AppVariables = {
  session?: { session: Session; user: User }
}

// const db: PrismaClient = prisma

const app = new Hono<{ Variables: AppVariables }>()
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
  .get('test/:messageId', (c) => {
    return c.json({ message: c.req.param('messageId') })
  })
  .on(['POST', 'GET', 'OPTIONS'], '/auth/*', (c) => {
    console.log('here')
    return auth.handler(c.req.raw)
  })
  .use(async (c, next) => authMiddleware(c, next))
  .get('test-auth', (c) => {
    return c.json({ message: 'Authenticated api!!' })
  })

async function authMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 403)
  }
  c.set('session', session)
  return next()
}

export { app }
export type App = typeof app
