import type { Field } from 'payload'

export const contactSection: Field = {
  name: 'contactSection',
  label: 'Contact Section',
  type: 'group',
  fields: [
    {
      name: 'contactSection',
      label: 'Contact Information',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'contacts',
          label: 'contacts',
          type: 'array',
          fields: [
            {
              name: 'phone',
              label: 'phone',
              type: 'text',
            },
          ],
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
        },
        {
          name: 'socialMediaLinks',
          label: 'Social Media Links',
          type: 'array',
          fields: [
            {
              name: 'socialMediaPlatform',
              label: 'Social Media Platform',
              type: 'select',

              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'X (Twitter)', value: 'x' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
              ],
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'contactForm',
      label: 'Contact Form',
      type: 'group',
      fields: [
        {
          name: 'services',
          label: 'Services Dropdown',
          type: 'array',
          fields: [
            {
              name: 'service',
              label: 'Service Name',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
