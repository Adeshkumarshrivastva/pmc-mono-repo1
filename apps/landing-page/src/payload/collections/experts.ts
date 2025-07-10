import { CollectionConfig } from 'payload'

export const Experts: CollectionConfig = {
  slug: 'experts',
  access: {
    create: () => true,
    read: () => true,
  },
  fields: [
    {
      name: 'expertName',
      type: 'text',
      label: 'Expert Name',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Image',
      relationTo: 'media',
    },
    {
      name: 'profession',
      type: 'text',
      label: 'Expert Profession',
      required: true,
    },
    {
      name: 'headline',
      type: 'richText',
      label: 'Head Line',
      required: false,
    },
  ],
}
