import type { Field } from 'payload'

export const mapSection: Field = {
  name: 'mapSection',
  label: 'Map Section',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'description',
      label: ' Description',
      type: 'richText',
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
