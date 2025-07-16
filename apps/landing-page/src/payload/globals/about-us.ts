import { GlobalConfig } from 'payload'

export const AboutUs: GlobalConfig = {
  slug: 'about-us',
  label: 'About Us',
  fields: [
    {
      name: 'aboutUsHeroSection',
      label: 'About Us Hero Section',
      type: 'group',
      fields: [
        {
          name: 'preHeader',
          label: 'Pre Header',
          type: 'text',
        },
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },

        {
          name: 'overlayContent',
          label: 'Overlay Content',
          type: 'group',
          fields: [
            {
              name: 'overlayImage',
              label: 'Overlay Image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heading',
              label: 'Overlay Heading',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Overlay Description',
              type: 'textarea',
            },
            {
              name: 'statistics',
              label: 'Statistics',
              type: 'array',
              fields: [
                {
                  name: 'value',
                  label: 'Value',
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'label',
                  label: 'Label',
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
