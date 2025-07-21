import { Field } from 'payload'

export const serivicesSection: Field = {
  name: 'servicesSection',
  label: 'Services Section',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Section Title',
      type: 'text',
    },
    {
      name: 'services',
      label: 'Services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
    },
    {
      name: 'action',
      label: 'Action Button Text',
      type: 'text',
    },
  ],
}
