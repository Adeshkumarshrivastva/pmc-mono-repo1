import { CollectionConfig } from 'payload'

export const Blog: CollectionConfig = {
  slug: 'blog',
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
  ],
}
