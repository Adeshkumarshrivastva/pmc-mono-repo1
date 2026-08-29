import type { CollectionConfig } from 'payload'

export const Testimonial: CollectionConfig = {
  slug: 'testimonial',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'authorName',
  },
  fields: [
    {
      name: 'type',
      type: 'radio',
      label: 'Testimonial Type',
      options: [
        {
          label: 'Text Testimonial',
          value: 'text',
        },
        {
          label: 'Video Testimonial',
          value: 'video',
        },
      ],
      defaultValue: 'text',
      admin: {
        layout: 'horizontal',
      },
    },
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
      admin: {
        condition: (data) => data.type === 'text',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      admin: {
        condition: (data) => data.type === 'text',
      },
    },
    {
      name: 'message',
      type: 'text',
      label: 'Message',
      admin: {
        condition: (data) => data.type === 'text',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL',
      admin: {
        condition: (data) => data.type === 'video',
        description: 'YouTub video link',
        placeholder: 'https://www.youtube.com/embed/v=...',
      },
    },
  ],
}
