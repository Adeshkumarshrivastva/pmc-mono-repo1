import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  access: {
    read: () => true,
    create: () => false,
    update: () => false,
  },
  fields: [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
    },
    {
      name: 'service',
      label: 'Service',
      type: 'relationship',
      relationTo: 'services',
      hasMany: false,
    },
    {
      name: 'subService',
      label: 'Sub Service',
      type: 'relationship',
      relationTo: 'services',
      hasMany: false,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
    },
    {
      name: 'quizId',
      label: 'Quiz Name',
      type: 'relationship',
      relationTo: 'quiz',
      hasMany: false,
    },
    {
      name: 'quizAnswers',
      label: 'Quiz Answers',
      type: 'array',
      fields: [
        {
          name: 'question',
          label: 'Question',
          type: 'text',
        },
        {
          name: 'answer',
          label: 'Answer',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
}
