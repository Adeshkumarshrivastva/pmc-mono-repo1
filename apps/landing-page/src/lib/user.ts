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

export async function fetchPublicUser(userId: string): Promise<User | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/server/users/public/${userId}`)

    if (!res.ok) {
      throw new Error(`Failed to fetch user with ID: ${userId}`)
    }

    const data = await res.json()
    const parsedUser = userSchema.safeParse(data)

    if (!parsedUser.success) {
      throw new Error(`Invalid user data for ID: ${userId}`)
    }

    return parsedUser.data
  } catch (err) {
    console.error('Error fetching public user:', err)
    return null
  }
}
export const sessionSchema = z.object({
  user: userSchema.nullable(),
})

export type Session = z.infer<typeof sessionSchema>
