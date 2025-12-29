import { env } from '@/env'
import * as z from 'zod'

export function getFileUrl(fileName: string) {
  return `${env.NEXT_PUBLIC_API_BASE_URL}/server/file/${fileName}`
}

const expertSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.enum([
    'PSYCHOLOGIST',
    'PSYCHIATRIST',
    'CLINICAL_PSYCHOLOGIST',
    'CONSULTANT_PHYSICIAN',
    'REHABILITATION_PSYCHOLOGIST',
    'COUNSELLING_PSYCHOLOGIST',
  ]),
  bio: z.string().optional(),
  image: z.string(),
  file: z
    .object({
      fileName: z.string(),
    })
    .nullable(),
})

export type Expert = z.infer<typeof expertSchema>

export async function fetchPublicExperts() {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/server/experts/public/list`)

    if (!res.ok) {
      throw new Error(`Failed to fetch experts`)
    }

    const data = await res.json()

    return z.array(expertSchema).parse(data)
  } catch (err) {
    console.error('Error fetching experts:', err)
    return []
  }
}
