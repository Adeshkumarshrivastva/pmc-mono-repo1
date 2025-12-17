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
      label: 'Slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from title (e.g., /quiz/anxiety-quiz)',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation, value }) => {
            if (operation === 'create' || operation === 'update') {
              if (!value && data?.title) {
                const baseSlug = data.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '')
                return `/quiz/${baseSlug}`
              }
            }
            return value
          },
        ],
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
    {
      name: 'riskLevels',
      label: 'Risk Levels',
      type: 'array',
      required: true,
      admin: {
        description: 'Score thresholds and risk level definitions for the assessment report',
      },
      fields: [
        {
          name: 'level',
          label: 'Level Name',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g., "Low Risk", "Increasing Risk", "Higher Risk"',
          },
        },
        {
          name: 'minScore',
          label: 'Minimum Score',
          type: 'number',
          required: true,
          admin: {
            description: 'Lower bound of the score range',
          },
        },
        {
          name: 'maxScore',
          label: 'Maximum Score',
          type: 'number',
          required: true,
          admin: {
            description: 'Upper bound of the score range',
          },
        },
        {
          name: 'color',
          label: 'Text Color',
          type: 'select',
          required: true,
          defaultValue: 'text-green-600',
          options: [
            { label: 'Green', value: 'text-green-600' },
            { label: 'Yellow', value: 'text-yellow-600' },
            { label: 'Orange', value: 'text-orange-600' },
            { label: 'Red', value: 'text-red-600' },
          ],
        },
        {
          name: 'bgColor',
          label: 'Background Color',
          type: 'select',
          required: true,
          defaultValue: 'bg-green-50 border-green-200',
          options: [
            { label: 'Green', value: 'bg-green-50 border-green-200' },
            { label: 'Yellow', value: 'bg-yellow-50 border-yellow-200' },
            { label: 'Orange', value: 'bg-orange-50 border-orange-200' },
            { label: 'Red', value: 'bg-red-50 border-red-200' },
          ],
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Summary of what this risk level means',
          },
        },
        {
          name: 'recommendations',
          label: 'Recommendations',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'text',
              label: 'Recommendation',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
  orderable: true,
  timestamps: true,
}
