import type { GlobalConfig } from 'payload'

export const Academy: GlobalConfig = {
  slug: 'academy',
  label: 'Academy',
  fields: [
    {
      name: 'heroSection',
      label: 'Hero Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'text',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
        {
          name: 'sectionImage',
          label: 'Section Image',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'cards',
          label: 'Cards',
          type: 'array',
          fields: [
            {
              name: 'icon',
              label: 'Icon',
              type: 'relationship',
              relationTo: 'media',
            },
            {
              name: 'text',
              label: 'Text',
              type: 'text',
            },
          ],
        },
        {
          name: 'button',
          label: 'Button',
          type: 'text',
        },
        {
          name: 'buttonLink',
          label: 'Button Link',
          type: 'text',
        },
      ],
    },
  ],
}
