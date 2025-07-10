import { Field } from 'payload'

export const ExpertsSection: Field = {
  name: 'expertsSection',
  label: 'Experts Section',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'experts',
      label: 'Add Experts',
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
}
