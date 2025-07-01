import { GlobalConfig } from 'payload'

// TODO: Create a collection package
// TODO: Create a collection testimonial
// TODO: Create a collection FAQ
// TODO: Create a collection blog

export const Home: GlobalConfig = {
  slug: 'home',
  fields: [
    {
      type: 'text',
      name: 'heroSectionTitle',
      required: true,
    },
    {
      type: 'richText',
      name: 'heroSectionDescription',
      required: true,
    },
    {
      type: 'relationship',
      relationTo: 'media',
      name: 'heroSectionImage',
      required: true,
    },
    {
      type: 'text',
      name: 'heroSectionAction',
      required: true,
    },
    // TODO: add feature section title, description, action
    {
      type: 'array',
      name: 'features',
      fields: [
        {
          type: 'text',
          name: 'featureTitle',
        },
        // TODO: add feature description, feature icon, feature image (optional)
        {
          type: 'select',
          name: 'featureBackground',
          options: [
            {
              label: 'Primary',
              value: 'primary',
            },
            {
              label: 'Accent',
              value: 'accent',
            },
          ],
          defaultValue: 'primary',
        },
      ],
    },
  ],
}
