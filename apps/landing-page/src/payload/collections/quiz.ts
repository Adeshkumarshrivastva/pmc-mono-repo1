import type { CollectionConfig } from 'payload'

export const Quiz: CollectionConfig = {
  slug: 'quiz',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['type', 'title', 'order'],
  },
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Section Header',
          value: 'section',
        },
        {
          label: 'Assessment Card',
          value: 'assessment',
        },
      ],
      admin: {
        description: 'Choose Section Header for page content or Assessment Card for quiz cards',
      },
    },

    {
      name: 'heading',
      label: 'Main Heading',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'section',
      },
    },
    {
      name: 'subtitle1',
      label: 'Subtitle 1',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'section',
      },
    },
    {
      name: 'subtitle2',
      label: 'Subtitle 2',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'section',
      },
    },

    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      admin: {
        condition: (data) => data.type === 'assessment',
      },
    },
    {
      name: 'image',
      label: 'Assessment Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        condition: (data) => data.type === 'assessment',
      },
    },
    {
      name: 'route',
      label: 'Route',
      type: 'text',
      required: true,
      admin: {
        condition: (data) => data.type === 'assessment',
        placeholder: '/quiz/anxiety-quiz',
        description: 'The URL path for this assessment',
      },
    },
    {
      name: 'order',
      label: 'Display Order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        condition: (data) => data.type === 'assessment',
        description: 'Lower numbers appear first',
      },
    },
  ],
  timestamps: true,
}
