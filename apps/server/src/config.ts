import { z } from 'zod'
import { getErrorMessage } from './lib/utils'
import { rootLogger } from './lib/logger'
import { env } from './lib/env'

export const configSchema = z.object({
  databaseUrl: z
    .string()
    .regex(
      /^mongodb(?:\+srv)?:\/\/(?:(?:[^:@,/?]+)(?::(?:[^:@,/?]+))?@)?(?:[^:@,/?]+)(?::(?:\d+))?(?:\/(?:[^:@,/?]+))?(?:\?(?:[^#]*))?$/,
    ),
  cors: z
    .object({
      origin: z.url(),
    })
    .optional()
    .default({
      origin: 'http://localhost:5173',
    }),
  auth: z.object({
    secret: z.string(),
    google: z.object({
      clientId: z.string(),
      clientSecret: z.string(),
    }),
  }),
})

export type ConfigSchema = z.infer<typeof configSchema>

export const config = getConfig()

function getConfig() {
  try {
    const config: ConfigSchema = configSchema.parse({
      databaseUrl: env.DATABASE_URL,
      auth: {
        secret: env.BETTER_AUTH_SECRET,
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
    })

    return config
  } catch (error) {
    rootLogger.error(getErrorMessage(error))
    throw error
  }
}
