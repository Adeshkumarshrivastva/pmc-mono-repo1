import { z } from 'zod'

export const env = z
  .object({
    VITE_PUBLIC_API_BASE_URL: z.url(),
    VITE_PUBLIC_BASE_PATH: z.string(),
    VITE_PUBLIC_RAZORPAY_KEY_ID: z.string(),
  })
  .parse(import.meta.env)
