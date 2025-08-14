import { z } from 'zod/v4'
import { getErrorMessage } from './lib/utils'
import { rootLogger } from './lib/logger'

export const configSchema = z.object({
  databaseUrl: z
    .string()
    .regex(
      /^mongodb(?:\+srv)?:\/\/(?:(?:[^:@,/?]+)(?::(?:[^:@,/?]+))?@)?(?:[^:@,/?]+)(?::(?:\d+))?(?:\/(?:[^:@,/?]+))?(?:\?(?:[^#]*))?$/,
    ),
  auth: z.object({
    secret: z.string(),
  }),
})

export type ConfigSchema = z.infer<typeof configSchema>

export const config = getConfig()

function getConfig() {
  try {
    const config: ConfigSchema = configSchema.parse({
      databaseUrl: process.env.DATABASE_URL,
      auth: {
        secret: process.env.BETTER_AUTH_SECRET,
      },
    })

    return config
  } catch (error) {
    rootLogger.error(getErrorMessage(error))
  }
}
