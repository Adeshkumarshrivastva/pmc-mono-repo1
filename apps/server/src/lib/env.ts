import { z } from 'zod'

export const env = z
  .object({
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  })
  .parse(process.env)
