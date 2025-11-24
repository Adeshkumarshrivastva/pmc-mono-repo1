import { z } from 'zod'

export const getWebinarsInput = z.object({
  limit: z.number().optional(),
  sort: z.string().optional(),
  page: z.number().optional(),
  search: z.string().optional(),
})

export type GetWebinarsInput = z.infer<typeof getWebinarsInput>

export const getWebinarInput = z.object({
  webinarSlug: z.string(),
})

export type GetWebinarInput = z.infer<typeof getWebinarInput>
