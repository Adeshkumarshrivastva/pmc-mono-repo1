import type { GlobalConfig } from 'payload'

export const ReturnPolicy: GlobalConfig = {
  slug: 'return-policy',
  label: 'Return Policy',
  fields: [
    {
      name: 'title',
      label: 'Page Title',
      type: 'text',
      required: true,
      defaultValue: 'Return & Refund Policy',
    },
    {
      name: 'lastUpdated',
      label: 'Last Updated Date',
      type: 'date',
      required: true,
    },
    {
      name: 'content',
      label: 'Policy Content',
      type: 'richText',
      required: true,
    },
  ],
}
