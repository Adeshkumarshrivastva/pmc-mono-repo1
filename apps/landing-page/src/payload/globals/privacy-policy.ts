import type { GlobalConfig } from 'payload'

export const PrivacyPolicy: GlobalConfig = {
  slug: 'privacy-policy',
  access: {
    read: () => true,
  },
  label: 'Privacy Policy',
  admin: {
    group: 'Legal',
    description: 'Manage the content of your privacy policy page.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Privacy Policy',
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'headline',
          type: 'text',
          localized: true,
        },
        {
          name: 'subhead',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyyy',
        },
        readOnly: true,
        position: 'sidebar',
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
