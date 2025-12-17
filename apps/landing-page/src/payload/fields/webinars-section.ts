import type { Field } from 'payload'

export const webinarsSection: Field = {
  name: 'webinarsSection',
  label: 'Webinars Section',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Section Title',
      type: 'text',
    },
    {
      name: 'description',
      label: 'Section Description',
      type: 'text',
    },
    {
      name: 'action',
      label: 'Action Button Text',
      type: 'text',
    },
  ],
}
