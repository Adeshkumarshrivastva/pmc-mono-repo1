import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    PAYLOAD_DB_URL: z.url(),
    PAYLOAD_SECRET: z.string(),
    PAYLOAD_BUCKET: z.string(),
    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_KEY_SECRET: z.string(),
    ZOHO_CLIENT_ID: z.string(),
    ZOHO_CLIENT_SECRET: z.string(),
    ZOHO_REFRESH_TOKEN: z.string(),
    API_BASE_URL: z.string(),
    ONESIGNAL_APP_API_KEY: z.string(),
    WHATSAPP_API_KEY_SECRET: z.string(),
    WHATSAPP_LICENCE_NUMBER_SECRET: z.string(),
    WHATSAPP_TEST_NUMBER_SECRET: z.string(),
    PAYLOAD_BUCKET_REGION: z.string(),
    PAYLOAD_BUCKET_ACCESS_KEY: z.string(),
    PAYLOAD_BUCKET_SECRET_KEY: z.string(),
    // Set only for self-hosted S3-compatible storage (e.g. MinIO), e.g.
    // http://minio:9000. Leave unset to use real AWS S3.
    PAYLOAD_BUCKET_ENDPOINT: z.string().optional(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
    NEXT_PUBLIC_API_BASE_URL: z.string().default('https://positivemindcare.com'),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    PAYLOAD_DB_URL: process.env.PAYLOAD_DB_URL,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    PAYLOAD_BUCKET: process.env.PAYLOAD_BUCKET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET,
    ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN,
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    ONESIGNAL_APP_API_KEY: process.env.ONESIGNAL_APP_API_KEY,
    WHATSAPP_API_KEY_SECRET: process.env.WHATSAPP_API_KEY_SECRET,
    WHATSAPP_LICENCE_NUMBER_SECRET: process.env.WHATSAPP_LICENCE_NUMBER_SECRET,
    WHATSAPP_TEST_NUMBER_SECRET: process.env.WHATSAPP_TEST_NUMBER_SECRET,
    PAYLOAD_BUCKET_REGION: process.env.PAYLOAD_BUCKET_REGION,
    PAYLOAD_BUCKET_ACCESS_KEY: process.env.PAYLOAD_BUCKET_ACCESS_KEY,
    PAYLOAD_BUCKET_SECRET_KEY: process.env.PAYLOAD_BUCKET_SECRET_KEY,
    PAYLOAD_BUCKET_ENDPOINT: process.env.PAYLOAD_BUCKET_ENDPOINT,
  },
})
