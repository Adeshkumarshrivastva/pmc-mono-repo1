import { z } from 'zod/v4'

export const env = z
  .object({
    VITE_PUBLIC_API_BASE_URL: z.url(),
  })
  .parse(import.meta.env)
