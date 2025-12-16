import type { Field } from 'payload'
import type { Media } from './types'

export const METADATA_FIELD: Field = {
  type: 'group',
  name: 'metadata',
  label: 'Metadata',
  fields: [{ type: 'text', name: 'title', localized: true }],
}

export function getURLFromMedia(media: Media | string) {
  if (typeof media === 'string') {
    return `http://localhost:3001${media}`
  } else if (media && typeof media.url === 'string') {
    return `http://localhost:3001${media.url}`
  }
  return ''
}

export function getAltFromFromMedia(media: Media | string) {
  if (typeof media === 'string') {
    return `http://localhost:3001${media}`
  } else if (media && typeof media.alt === 'string') {
    return `http://localhost:3001${media.url}`
  }
  return ''
}
