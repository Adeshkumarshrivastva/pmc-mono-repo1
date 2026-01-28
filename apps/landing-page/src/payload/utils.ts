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
    return `https://positivemindcare.com${media}`
  } else if (media && typeof media.url === 'string') {
    return `https://positivemindcare.com${media.url}`
  }
  return ''
}

export function getAltFromFromMedia(media: Media | string) {
  if (typeof media === 'string') {
    return `https://positivemindcare.com${media}`
  } else if (media && typeof media.alt === 'string') {
    return `https://positivemindcare.com${media.alt}`
  }
  return ''
}
