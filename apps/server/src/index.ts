import { handle } from 'hono/aws-lambda'
import { app } from './app'
import { rootLogger } from './lib/logger'

let handler: ReturnType<typeof handle> | undefined
if (process.env.SST_ENV) {
  handler = handle(app)
} else {
  const server = Bun.serve({
    fetch: app.fetch,
    port: process.env.PORT,
  })
  rootLogger.info(`server started at ${server.url}`)
}

export { handler }
