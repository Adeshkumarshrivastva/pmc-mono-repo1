import { GlobalConfig } from 'payload'

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
          name: 'description',
          label: 'Description',
          type: 'richText',
        },
      ],
    },
  ],
}
