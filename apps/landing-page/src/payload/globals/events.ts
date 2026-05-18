import type { GlobalConfig } from 'payload'

export const Events: GlobalConfig = {
  slug: 'events',
  label: 'Events & Camps Page',
  fields: [
    {
      name: 'title',
      label: 'Page Title',
      type: 'text',
      required: true,
      defaultValue: 'Events & Camps',
    },
    {
      name: 'description',
      label: 'Page Description',
      type: 'textarea',
    },
    {
      name: 'imagesSection',
      label: 'Images Section',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Section Heading',
          type: 'text',
          defaultValue: 'Photo Gallery',
        },
        {
          name: 'description',
          label: 'Section Description',
          type: 'textarea',
        },
        {
          name: 'images',
          label: 'Images',
          type: 'array',
          admin: {
            description: 'Drag and drop to reorder images',
          },
          fields: [
            {
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'caption',
              label: 'Caption (Optional)',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'videosSection',
      label: 'Videos Section',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Section Heading',
          type: 'text',
          defaultValue: 'Video Gallery',
        },
        {
          name: 'description',
          label: 'Section Description',
          type: 'textarea',
        },
        {
          name: 'videos',
          label: 'Videos',
          type: 'array',
          admin: {
            description: 'Drag and drop to reorder videos',
          },
          fields: [
            {
              name: 'video',
              label: 'Video File',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'caption',
              label: 'Caption (Optional)',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
