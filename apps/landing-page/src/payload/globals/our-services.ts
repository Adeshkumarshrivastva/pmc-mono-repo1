import { GlobalConfig } from 'payload'

export const OurServices: GlobalConfig = {
  slug: 'our-services',
  label: 'Our Services',
  fields: [
    {
      name: 'servicesHeroSection',
      label: 'Services Hero Section',
      type: 'group',
      fields: [
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },
        {
          name: 'action',
          label: 'Action',
          type: 'text',
        },
        {
          name: 'featureCards',
          label: 'Feature Cards',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
            },
            {
              name: 'featureImage',
              label: 'Feature Image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
  ],
}
