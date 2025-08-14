import { handle } from 'hono/aws-lambda'
import { config } from './config'
import { invariant } from './lib/utils'

invariant(config, 'Config is required')

const PmcServer = await import('./app').then((mod) => mod.PmcServer)
const server = new PmcServer(config, process.env.NODE_ENV === 'production' ? 'production' : 'dev')

export const handler = handle(server.honoApp)
