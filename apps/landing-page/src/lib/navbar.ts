import { env } from '@/env'
import * as z from 'zod'

export function getFileUrl(fileName: string) {
  return `${env.NEXT_PUBLIC_API_BASE_URL}/server/file/${fileName}`
}

export const userSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
})

export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  user: userSchema.nullable(),
})

export type Session = z.infer<typeof sessionSchema>
