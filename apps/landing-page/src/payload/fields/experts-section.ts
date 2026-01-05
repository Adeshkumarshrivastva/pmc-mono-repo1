import type { Field } from 'payload'

export const expertsSection: Field = {
  name: 'expertsSection',
  label: 'Experts Section',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Section Title',
      type: 'text',
    },
    {
      name: 'action',
      label: 'Expert action',
      type: 'text',
    },
  ],
}
