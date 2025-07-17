import { CollectionConfig } from 'payload'

export const Testimonial: CollectionConfig = {
  slug: 'testimonial',
  access: {
    create: () => true,
    read: () => true,
  },
  fields: [
    {
      name: 'authorName',
      type: 'text',
      label: 'Author Name',
      required: true,
    },
    {
      name: 'auhtorImage',
      type: 'upload',
      label: 'Author Image',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'message',
      type: 'text',
      label: 'Message',
      required: true,
    },
  ],
}
