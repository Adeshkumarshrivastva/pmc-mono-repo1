import type { Field } from 'payload'

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
      name: 'action',
      label: 'Action Button Text',
      type: 'text',
    },
    {
      name: 'cardAction',
      label: 'Card Action Button Text',
      type: 'text',
    },
  ],
}
