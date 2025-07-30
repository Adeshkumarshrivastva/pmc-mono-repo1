import { z } from 'zod/v4'

export const getBlogsInput = z.object({
  limit: z.number().optional(),
  sort: z.string().optional(),
  page: z.number().optional(),
})

export type GetBlogsInput = z.infer<typeof getBlogsInput>

export const getBlogInput = z.object({
  blogId: z.string(),
})

export type GetBlogInput = z.infer<typeof getBlogInput>
