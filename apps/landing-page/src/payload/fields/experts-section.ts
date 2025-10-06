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
      name: 'experts',
      label: 'Experts',
      type: 'relationship',
      relationTo: 'experts',
      hasMany: true,
    },
    {
      name: 'action',
      label: 'Expert action',
      type: 'text',
    },
  ],
}
