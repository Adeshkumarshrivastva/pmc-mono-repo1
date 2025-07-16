import { CollectionConfig } from 'payload'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  access: {
    create: () => true,
    read: () => true,
  },
  fields: [
    {
      name: 'memberName',
      type: 'text',
      label: 'Member Name',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Image',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: 'Member Role',
      required: true,
    },
  ],
}
