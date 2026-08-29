import type { GlobalConfig } from 'payload'

export const OutingPage: GlobalConfig = {
  slug: 'outing-page',
  access: {
    read: () => true,
  },
  label: 'Outing Page',
  admin: {
    group: 'Pages',
  },
  fields: [
    {
      name: 'title',
      label: 'Page Title',
      type: 'text',
      required: true,
      defaultValue: 'Mental Health Wellness Outing',
    },
    {
      name: 'subtitle',
      label: 'Subtitle',
      type: 'textarea',
      required: false,
      defaultValue: 'Join us for a refreshing experience designed to promote relaxation and personal growth',
    },
    {
      name: 'mainImage',
      label: 'Main Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
      required: false,
    },
    {
      name: 'features',
      label: 'Features/What\'s Included',
      type: 'array',
      fields: [
        {
          name: 'feature',
          label: 'Feature',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
