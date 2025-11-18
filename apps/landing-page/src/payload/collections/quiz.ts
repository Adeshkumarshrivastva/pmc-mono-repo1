import type { CollectionConfig } from 'payload'

export const Quiz: CollectionConfig = {
  slug: 'quiz',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
  },
  fields: [
    {
      name: 'title',
      label: 'Assessment Title',
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
      name: 'slug',
      label: 'slug',
      type: 'text',
      required: true,
      admin: {
        placeholder: '/quiz/anxiety-quiz',
        description: 'The URL path for this assessment',
      },
    },

    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      admin: {
        description: 'Shown at the top of the quiz page',
      },
    },
    {
      name: 'questionnaire',
      label: 'Questionnaire',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'question',
          label: 'Question',
          type: 'text',
          required: true,
        },
        {
          name: 'options',
          label: 'Options',
          type: 'array',
          required: true,
          minRows: 2,
          fields: [
            {
              name: 'value',
              label: 'Value',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g., "a", "b", "c"',
              },
            },
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: true,
              admin: {
                description: 'e.g., "Not at all", "Sometimes"',
              },
            },
            {
              name: 'score',
              label: 'Score',
              type: 'number',
              required: true,
              defaultValue: 0,
              admin: {
                description: 'Points awarded for this option',
              },
            },
          ],
        },
      ],
    },
  ],
  orderable: true,
  timestamps: true,
}
