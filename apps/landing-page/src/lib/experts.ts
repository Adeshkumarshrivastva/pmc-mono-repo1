import * as z from 'zod'

const API_BASE_URL = 'https://d31eagfyx01jm2.cloudfront.net'

export function getFileUrl(fileName: string) {
  return `${API_BASE_URL}/server/file/${fileName}`
}

const expertSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  bio: z.string().optional(),
  image: z.string(),
  file: z.object().nullable(),
})

export type Expert = z.infer<typeof expertSchema>

export async function fetchPublicExperts() {
  try {
    const res = await fetch(`${API_BASE_URL}/server/experts/public/list`)

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
