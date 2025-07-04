import { GlobalConfig } from 'payload'

export const ContactUs: GlobalConfig = {
  slug: 'contact-us',
  label: 'Contact Us',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'subTitle',
      label: 'Sub Title',
      type: 'text',
      required: true,
    },
    {
      name: 'benefits',
      label: 'Benefits List',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'benefit',
          label: 'Add Benefit',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
