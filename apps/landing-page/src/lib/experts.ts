import { env } from '@/env'
import * as z from 'zod'
import { DAY_MAP } from './utils'

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
  image: z.string().nullable().optional(),
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

export const specializationOptions = [
  { value: 'Academic Stress', label: 'Academic Stress' },
  { value: 'Addiction', label: 'Addiction' },
  { value: 'Adolescent Therapy', label: 'Adolescent Therapy' },
  { value: 'Anxiety', label: 'Anxiety' },
  { value: 'Anxiety Disorders', label: 'Anxiety Disorders' },
  { value: 'Anxiety Management', label: 'Anxiety Management' },
  { value: 'Behavioral Issues', label: 'Behavioral Issues' },
  { value: 'Bipolar Disorder', label: 'Bipolar Disorder' },
  { value: 'CBT', label: 'CBT' },
  { value: 'Child Psychology', label: 'Child Psychology' },
  { value: 'Deep TMS Therapy', label: 'Deep TMS Therapy' },
  { value: 'Depression', label: 'Depression' },
  { value: 'Family Therapy', label: 'Family Therapy' },
  { value: 'Medication Management', label: 'Medication Management' },
  { value: 'Mindfulness', label: 'Mindfulness' },
  { value: 'Motivational Therapy', label: 'Motivational Therapy' },
  { value: 'Perinatal Psychiatry', label: 'Perinatal Psychiatry' },
  { value: 'Positive Psychology', label: 'Positive Psychology' },
  { value: 'Psychometric Testing', label: 'Psychometric Testing' },
  { value: 'PTSD', label: 'PTSD' },
  { value: 'Resilience Building', label: 'Resilience Building' },
  { value: 'Self-esteem Issues', label: 'Self-esteem Issues' },
  { value: 'Stress Management', label: 'Stress Management' },
  { value: 'Stress Reduction', label: 'Stress Reduction' },
  { value: 'Talk Therapy', label: 'Talk Therapy' },
  { value: 'Trauma', label: 'Trauma' },
  { value: 'Trauma Therapy', label: 'Trauma Therapy' },
  { value: "Women's Mental Health", label: "Women's Mental Health" },
]

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

export function isExpertOnline(
  availability?: {
    dayOfTheWeek: string
    endTime: string
    isActive: boolean
  }[],
): boolean {
  if (!availability || availability.length === 0) {
    return false
  }

  const currentDayOfWeek = DAY_MAP[new Date().getDay()]

  const currentMinutes = new Date().getUTCHours() * 60 + new Date().getUTCMinutes()
  return availability.some((slot) => {
    if (!slot.isActive) {
      return false
    }
    if (slot.dayOfTheWeek !== currentDayOfWeek) {
      return false
    }

    const endTime = new Date(slot.endTime)
    const endMinutes = endTime.getUTCHours() * 60 + endTime.getUTCMinutes()

    return endMinutes > currentMinutes
  })
}
