import type { Field } from 'payload'

export const achievementSection: Field = {
  name: 'achievementSection',
  label: 'Achievement Section',
  type: 'group',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'achievements',
      label: 'Achievements',
      type: 'array',
      fields: [
        {
          name: 'number',
          label: 'Number',
          type: 'text',
        },
        {
          name: 'label',
          label: 'Label',
          type: 'text',
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
