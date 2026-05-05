import { z } from 'zod'

export const env = z
  .object({
    VITE_PUBLIC_API_BASE_URL: z.string().refine((val) => {
      try {
        new URL(val)
        return true
      } catch {
        return false
      }
    }, 'Invalid URL'),
    VITE_PUBLIC_BASE_PATH: z.string(),
    VITE_PUBLIC_RAZORPAY_KEY_ID: z.string(),
  })
  .parse(import.meta.env)
