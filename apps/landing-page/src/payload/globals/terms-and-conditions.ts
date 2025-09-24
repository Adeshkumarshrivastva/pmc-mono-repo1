import type { GlobalConfig } from 'payload'

export const TermsAndConditions: GlobalConfig = {
  slug: 'terms-and-conditions',
  label: 'Terms & Conditions',
  admin: {
    group: 'Legal',
    description: 'Manage the content of your terms and conditions page.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Terms & Conditions',
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
      localized: true,
    },
  ],
}
