import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod/v4'

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    PAYLOAD_DB_URL: z.url(),
    PAYLOAD_SECRET: z.string(),
    PAYLOAD_BUCKET: z.string(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {},
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
  },
})
