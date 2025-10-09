import type { Field } from 'payload'

export const quizSection: Field = {
  name: 'quizSection',
  label: 'Quiz Section',
  type: 'group',
  fields: [
    {
      name: 'quizTitle',
      label: 'Quiz Title',
      type: 'richText',
      required: true,
    },
    {
      name: 'quizDescription',
      label: 'Quiz Description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'quizFeatures',
      label: 'Quiz Features',
      type: 'array',
      fields: [
        {
          name: 'text',
          label: 'Feature Text',
          type: 'text',
          required: true,
        },
      ],
      minRows: 1,
      maxRows: 5,
    },
    {
      name: 'quizButtonText',
      label: 'Primary Button Text',
      type: 'text',
      defaultValue: 'Take the Test Now',
    },
    {
      name: 'quizImage',
      label: 'Quiz Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
}
