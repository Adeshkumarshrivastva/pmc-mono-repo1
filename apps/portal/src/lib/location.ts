import z from 'zod'
import { MapPinIcon, VideoIcon, type LucideIcon } from 'lucide-react'
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
