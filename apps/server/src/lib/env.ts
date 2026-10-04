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
    SMS_API_BASE_URL: z.string(),
    SMS_UNAME: z.string(),
    SMS_PASS: z.string(),
    SMS_SENDER_ID: z.string(),
    BROWSERLESS_WS_ENDPOINT: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_REGION: z.string(),
    S3_BUCKET: z.string(),
    // Set only for self-hosted S3-compatible storage (e.g. MinIO). Leave
    // unset to use real AWS S3 (s3.<region>.amazonaws.com) as before.
    S3_ENDPOINT: z.string().optional(),
    S3_PORT: z.coerce.number().optional(),
    S3_USE_SSL: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? true : val === 'true')),
    CORS_ORIGIN: z.string().optional(),
    // Dev-only override: sends real SMS/WhatsApp OTPs even when NODE_ENV !==
    // 'production', so the phoneNumber flow can be tested end-to-end on a
    // real phone without flipping NODE_ENV (which also changes cookie
    // sameSite/secure attributes used by the web portal). See lib/auth.ts.
    FORCE_REAL_OTP_SMS: z.string().optional(),
  })
  .parse(process.env)
