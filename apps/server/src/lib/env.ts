import { z } from 'zod'

export const NodeEnv = {
  production: 'production',
  development: 'development',
} as const

export const env = z
  .object({
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    JWT_SECRET: z.string(),
    NODE_ENV: z.enum([NodeEnv.development, NodeEnv.production]).default(NodeEnv.development),
    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_KEY_SECRET: z.string(),
  })
  .parse(process.env)
