import type { GlobalConfig } from 'payload'

export const Academy: GlobalConfig = {
  slug: 'academy',
  access: {
    read: () => true,
  },
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
          name: 'subtitle',
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
    {
      name: 'whyChoose',
      label: 'Why Choose Us Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'subtitle',
          label: 'Sub Title',
          type: 'text',
        },
        {
          name: 'subtitleAlt',
          label: 'Sub Title Alt',
          type: 'text',
        },
        {
          name: 'features',
          label: 'Features',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'background',
              label: 'Background',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Accent', value: 'accent' },
              ],
              defaultValue: 'primary',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
            },
            {
              name: 'stampImage',
              label: 'Stamp Image',
              type: 'relationship',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'servicesSection',
      label: 'Services Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'subtitle',
          label: 'Sub Title',
          type: 'text',
        },
        {
          name: 'cards',
          label: 'Cards',
          type: 'array',
          fields: [
            {
              name: 'icon',
              label: 'Icon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
            },
            {
              name: 'subHeading',
              label: 'Sub Heading',
              type: 'text',
            },
            {
              name: 'about',
              label: 'Description',
              type: 'richText',
            },
          ],
        },
      ],
    },
    {
      name: 'faqSection',
      label: 'FAQ Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'qna',
          label: 'FAQ Questions And Answer',
          type: 'array',
          fields: [
            {
              name: 'question',
              label: 'Question',
              type: 'text',
            },
            {
              name: 'answer',
              label: 'Answer',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
