import { z } from 'zod/v4'

export const env = z
  .object({
    VITE_PUBLIC_API_BASE_URL: z.url(),
    VITE_PUBLIC_BASE_PATH: z.string(),
  })
  .parse(import.meta.env)
