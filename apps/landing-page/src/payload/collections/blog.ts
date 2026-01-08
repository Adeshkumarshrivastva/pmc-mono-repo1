import type { CollectionConfig } from 'payload'
import { sendBlogNotification } from '../../lib/onesignal'

export const Blog: CollectionConfig = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    create: () => true,
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Blog Title',
      required: true,
    },
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
    {
      name: 'author',
      type: 'text',
      label: 'Author',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'services',
      label: 'Category',
      hasMany: true,
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Image',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Blog Content',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published At',
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'update') {
          await sendBlogNotification(doc)
        }
        return doc
      },
    ],
  },
}
