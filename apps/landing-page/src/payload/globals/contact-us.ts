import type { GlobalConfig } from 'payload'

export const ContactUs: GlobalConfig = {
  slug: 'contact-us',
  label: 'Contact Us',
  fields: [
    {
      name: 'contactUs',
      label: 'Contact Us',
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
