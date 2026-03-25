import type { GlobalConfig } from 'payload'

export const Franchise: GlobalConfig = {
  slug: 'franchise',
  label: 'Franchise',
  fields: [
    {
      name: 'franchise',
      label: 'Franchise',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'subtitle',
          label: 'SubTitle',
          type: 'textarea',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },
      ],
    },
  ],
}
