import { type Field } from 'payload'
import { Media } from './types'

export const METADATA_FIELD: Field = {
  type: 'group',
  name: 'metadata',
  label: 'Metadata',
  fields: [{ type: 'text', name: 'title', localized: true }],
}

export function getURLFromMedia(media: Media | string) {
  if (typeof media === 'string') {
    return media
  } else if (media && typeof media.url === 'string') {
    return media.url
  }
  return ''
}
