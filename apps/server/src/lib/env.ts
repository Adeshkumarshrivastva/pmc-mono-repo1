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
    GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string(),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string(),
    GOOGLE_CALENDAR_EMAIL: z.string(),
    JWT_SECRET: z.string(),
    NODE_ENV: z.enum([NodeEnv.development, NodeEnv.production]).default(NodeEnv.development),
    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_KEY_SECRET: z.string(),
    WHATSAPP_API_KEY_SECRET: z.string(),
    WHATSAPP_LICENCE_NUMBER_SECRET: z.string(),
    WHATSAPP_TEST_NUMBER_SECRET: z.string(),
    EMAIL_SENDER: z.string(),
    SMS_SERVICE_USERID: z.string(),
    SMS_SERVICE_PASSWORD: z.string(),
    BROWSERLESS_WS_ENDPOINT: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_REGION: z.string(),
    S3_BUCKET: z.string(),
  })
  .parse(process.env)
