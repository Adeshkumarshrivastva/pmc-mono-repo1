import type { CollectionConfig } from 'payload'

export const Webinars: CollectionConfig = {
  slug: 'webinars',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'date', type: 'date', required: true },
    {
      name: 'speaker',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        { name: 'profession', type: 'text' },
      ],
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'videoLink', type: 'text' },
    { name: 'description', type: 'richText' },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation, value }) => {
            if (operation === 'create' || operation === 'update') {
              if (!value && data?.title) {
                return data.title
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '')
              }
            }
            return value
          },
        ],
      },
    },
  ],
}
