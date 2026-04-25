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
      origin: env.CORS_ORIGIN ?? 'http://localhost:5173',
    }),
  auth: z.object({
    secret: z.string(),
    google: z.object({
      clientId: z.string(),
      clientSecret: z.string(),
    }),
  }),
  payment: z.object({
    razorpay: z.object({
      keyId: z.string(),
      keySecret: z.string(),
    }),
  }),
  whatsapp: z.object({
    apiKey: z.string(),
    licenceNumber: z.string(),
    testNumber: z.string(),
  }),
  email: z.object({
    emailSender: z.string(),
  }),
  google: z.object({
    serviceAccountEmail: z.string(),
    serviceACcountPrivateKey: z.string(),
    calendarEmail: z.string(),
  }),
  sms: z.object({
    userId: z.string(),
    password: z.string(),
  }),
  browserlessWsUrl: z.string(),
  minio: z.object({
    accessKey: z.string(),
    secretKey: z.string(),
    region: z.string(),
    bucket: z.string(),
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
      payment: {
        razorpay: {
          keyId: env.RAZORPAY_KEY_ID,
          keySecret: env.RAZORPAY_KEY_SECRET,
        },
      },
      whatsapp: {
        apiKey: env.WHATSAPP_API_KEY_SECRET,
        licenceNumber: env.WHATSAPP_LICENCE_NUMBER_SECRET,
        testNumber: env.WHATSAPP_TEST_NUMBER_SECRET,
      },
      google: {
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        serviceACcountPrivateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        calendarEmail: env.GOOGLE_CALENDAR_EMAIL,
      },
      email: {
        emailSender: env.EMAIL_SENDER,
      },
      sms: {
        userId: env.SMS_SERVICE_USERID,
        password: env.SMS_SERVICE_PASSWORD,
      },
      browserlessWsUrl: env.BROWSERLESS_WS_ENDPOINT,
      minio: {
        accessKey: env.S3_ACCESS_KEY,
        secretKey: env.S3_SECRET_KEY,
        region: env.S3_REGION,
        bucket: env.S3_BUCKET,
      },
    })

    return config
  } catch (error) {
    rootLogger.error(getErrorMessage(error))
    throw error
  }
}
