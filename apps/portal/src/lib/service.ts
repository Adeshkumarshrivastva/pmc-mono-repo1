import z from 'zod'
import { MapPinIcon, VideoIcon, type LucideIcon } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { BookingLocation } from './booking'

export const SERVICE_MODE_CONFIG: Record<BookingLocation, { label: string; value: BookingLocation; icon: LucideIcon }> =
  {
    IN_PERSON: {
      label: 'In Person',
      value: 'IN_PERSON',
      icon: MapPinIcon,
    },
    VIRTUAL: {
      label: 'Virtual',
      value: 'VIRTUAL',
      icon: VideoIcon,
    },
  }

export const IN_PERSON_LOCATIONS = [
  {
    address: '804 (A), Arcadia, South City II, Sector 49, Gurugram, Fatehpur, Haryana 122018',
    googleMapLink: 'https://maps.app.goo.gl/K3FgwML8LxX6ZyEm6',
  },
] as const

export const inPersonLocationSchema = z
  .object({
    address: z.string(),
    googleMapLink: z.string().nullable(),
  })
  .nullable()

// TODO: We will change it to discriminated union when we support multiple virtual location types
export const virtualLocationSchema = z
  .object({
    type: z.literal('google_meet'),
    meetLink: z.string(),
  })
  .nullable()

export function generateServiceSlug(name: string): string {
  const formattedName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const id = nanoid(4)

  return `${formattedName}-${id}`
}
