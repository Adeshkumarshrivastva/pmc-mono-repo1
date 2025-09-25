import { CollectionConfig } from 'payload'

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
}
