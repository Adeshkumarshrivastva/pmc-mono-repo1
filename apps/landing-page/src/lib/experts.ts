import { env } from '@/env'
import * as z from 'zod'

export function getFileUrl(fileName: string) {
  return `${env.NEXT_PUBLIC_API_BASE_URL}/server/file/${fileName}`
}

const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationInMinutes: z.number(),
  price: z.number(),
  currency: z.string(),
  availableModes: z.array(z.string()),
  city: z.string().nullable(),
  country: z.string().nullable(),
  slug: z.string(),
})

const availabilitySchema = z.object({
  dayOfTheWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
})

const expertSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  image: z.string(),
  type: z.enum([
    'PSYCHOLOGIST',
    'PSYCHIATRIST',
    'CLINICAL_PSYCHOLOGIST',
    'CONSULTANT_PHYSICIAN',
    'REHABILITATION_PSYCHOLOGIST',
    'COUNSELLING_PSYCHOLOGIST',
  ]),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  avgRating: z.number().nullable().optional(),
  bio: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  gender: z.string().optional(),
  servicesProvided: z.array(serviceSchema).optional(),
  experienceInYears: z.number().nullable().optional(),
  availability: z.array(availabilitySchema).optional(),
  file: z.object({ fileName: z.string() }).nullable(),
})

export type Expert = z.infer<typeof expertSchema>

export async function fetchPublicExperts() {
  try {
    console.log(`${env.NEXT_PUBLIC_API_BASE_URL}/server/experts/public/list`)
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/server/experts/public/list`)

    if (!res.ok) {
      throw new Error(`Failed to fetch experts`)
    }

    const data = await res.json()
    console.log('data', data)

    return z.array(expertSchema).parse(data)
  } catch (err) {
    console.error('Error fetching experts:', err)
    return []
  }
}
