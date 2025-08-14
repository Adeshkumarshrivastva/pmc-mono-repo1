import { Context, Hono, Next } from 'hono'
import type { betterAuth, Session, User } from 'better-auth'
import { ConfigSchema } from './config'
import type { PrismaClient } from './lib/db'
import { prisma } from './lib/db'
import { auth } from './lib/auth'

type AppVariables = {
  session?: { session: Session; user: User }
}

export class PmcServer {
  private readonly app: Hono<{ Variables: AppVariables }>
  private readonly db: PrismaClient
  private readonly auth: ReturnType<typeof betterAuth>

  constructor(
    private readonly config: ConfigSchema,
    private readonly mode: 'dev' | 'production',
  ) {
    this.db = prisma
    this.auth = auth

    this.app = this.createApp()
  }

  private createApp() {
    return new Hono<{ Variables: AppVariables }>()
      .basePath('/server')
      .get('/', (c) => {
        return c.json({ message: 'Hello World' })
      })
      .get('test/:messageId', (c) => {
        return c.json({ message: c.req.param('messageId') })
      })
      .on(['POST', 'GET'], '/auth/*', (c) => {
        return this.auth.handler(c.req.raw)
      })
      .use(async (c, next) => this.authMiddleware(c, next))
      .get('test-auth', (c) => {
        return c.json({ message: 'Authenticated api!!' })
      })
  }

  private async authMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
    const session = await this.auth.api.getSession({
      headers: c.req.raw.headers,
    })
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    c.set('session', session)
    return next()
  }

  get honoApp() {
    return this.app
  }
}
