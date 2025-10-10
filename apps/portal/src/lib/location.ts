import { MapPin, VideoIcon, type LucideIcon } from 'lucide-react'
import type { BookingLocation } from './booking'

export const SERVICE_MODE_CONFIG: Record<BookingLocation, { label: string; value: BookingLocation; icon: LucideIcon }> =
  {
    IN_PERSON: {
      label: 'In Person',
      value: 'IN_PERSON',
      icon: MapPin,
    },
    VIRTUAL: {
      label: 'Virtual',
      value: 'VIRTUAL',
      icon: VideoIcon,
    },
  }
