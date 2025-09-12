import type { CollectionConfig } from 'payload'

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
      type: 'select',
      options: [
        { value: 'Psychologist', label: 'Psychologist' },
        { value: 'Psychiatrist', label: 'Psychiatrist' },
      ],
      label: 'Expert Profession',
      required: true,
    },
    {
      name: 'headline',
      type: 'richText',
      label: 'Head Line',
      required: false,
    },
    {
      name: 'experties',
      type: 'relationship',
      label: 'Experties',
      relationTo: 'services',
      hasMany: true,
    },
    {
      name: 'minimumFee',
      type: 'number',
      label: 'Minimum Fee',
      min: 0,
    },
    {
      name: 'sessionDuration',
      type: 'number',
      label: 'Session Duration',
      admin: {
        description: 'Duration in minutes',
      },
      min: 15,
    },
    {
      name: 'bookingLink',
      type: 'text',
      label: 'Booking Link',
      admin: {
        description: 'Calendly or other booking link',
      },
    },
  ],
}
