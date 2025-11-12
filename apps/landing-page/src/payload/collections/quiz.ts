import type { CollectionConfig } from 'payload'

export const Assessments: CollectionConfig = {
  slug: 'assessments',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'route', 'order'],
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      label: 'Assessment Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'route',
      label: 'Route',
      type: 'text',
      required: true,
      admin: {
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
        description: 'Lower numbers appear first',
      },
    },
  ],
  timestamps: true,
}
