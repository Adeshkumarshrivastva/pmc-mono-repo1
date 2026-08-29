import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  label: 'Footer',
  fields: [
    {
      name: 'footer',
      label: 'Footer',
      type: 'group',
      fields: [
        {
          name: 'social',
          label: 'Social',
          type: 'array',
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
            },
            {
              name: 'icon',
              label: 'Icon',
              type: 'relationship',
              relationTo: 'media',
            },
          ],
        },
        {
          name: 'info',
          label: 'Added info',
          type: 'group',
          fields: [
            {
              name: 'image',
              label: 'Image',
              type: 'relationship',
              relationTo: 'media',
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'info',
              label: 'Info',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
