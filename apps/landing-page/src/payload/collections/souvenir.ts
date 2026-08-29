import type { CollectionConfig } from 'payload'

export const Souvenir: CollectionConfig = {
  slug: 'souvenirs',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      required: true,
      admin: {
        description: 'Shown once as the heading of the souvenir section/page',
      },
    },
    {
      name: 'products',
      type: 'array',
      label: 'Products',
      admin: {
        description: 'Add all souvenir products here',
      },
      fields: [
        {
          name: 'productName',
          type: 'text',
          label: 'Product Name',
          required: true,
        },
        {
          name: 'images',
          type: 'array',
          label: 'Product Images',
          minRows: 1,
          admin: {
            description: 'Add one or more images. First image is shown as main.',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Image',
              required: true,
            },
          ],
        },
        {
          name: 'price',
          type: 'number',
          label: 'Price (₹ INR)',
          required: true,
          admin: {
            description: 'Enter price in Indian Rupees (₹)',
          },
        },
        {
          name: 'about',
          type: 'textarea',
          label: 'About the Product',
        },
        {
          name: 'whySpecial',
          type: 'array',
          label: 'Why This is Special',
          admin: {
            description: 'Add each point as a separate item',
          },
          fields: [
            {
              name: 'point',
              type: 'text',
              label: 'Point',
              required: true,
            },
          ],
        },
        {
          name: 'specifications',
          type: 'array',
          label: 'Specifications',
          fields: [
            {
              name: 'key',
              type: 'text',
              label: 'Specification Name',
            },
            {
              name: 'value',
              type: 'text',
              label: 'Specification Value',
            },
          ],
        },
        {
          name: 'disclaimer',
          type: 'textarea',
          label: 'Disclaimer',
        },
      ],
    },
  ],
}
