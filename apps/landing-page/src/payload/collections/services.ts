import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  // Public read (matches Media/Experts/TeamMembers below) — this collection
  // backs the public /services/[slug] pages AND the pmcapp mobile client
  // (see pmcapp src/lib/landing-services.ts), which hits the REST API
  // directly with no auth. Without this, Payload's default access control
  // 403s every unauthenticated request, including those.
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      label: 'Service Name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Image',
      relationTo: 'media',
    },
    {
      name: 'parent',
      type: 'relationship',
      label: 'Parent Service',
      relationTo: 'services',
      hasMany: false,
      admin: {
        description: 'Leave empty for Main Service.',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'subservices',
      label: 'Sub Services',
      type: 'join',
      collection: 'services',
      on: 'parent',
      hasMany: true,
    },
  ],
  orderable: true,
}
