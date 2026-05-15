import type { CollectionConfig } from 'payload'

export const PopupNotifications: CollectionConfig = {
  slug: 'popup-notifications',
  admin: {
    useAsTitle: 'popupName',
  },
  fields: [
    {
      name: 'popupName',
      label: 'Popup Name',
      type: 'text',
      required: true,
    },
    {
      name: 'heading',
      label: 'Heading',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'image',
      label: 'Image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'primaryButton',
      label: 'Primary Button (Book Now)',
      type: 'group',
      fields: [
        {
          name: 'text',
          label: 'Button Text',
          type: 'text',
          defaultValue: 'Book Now',
        },
        {
          name: 'link',
          label: 'Button Link',
          type: 'text',
          defaultValue: '/outing/book',
        },
      ],
    },
    {
      name: 'secondaryButton',
      label: 'Secondary Button (Return Policy)',
      type: 'group',
      fields: [
        {
          name: 'text',
          label: 'Button Text',
          type: 'text',
          defaultValue: 'Return Policy',
        },
        {
          name: 'link',
          label: 'Button Link',
          type: 'text',
          defaultValue: '/return-policy',
        },
      ],
    },
    {
      name: 'seeMoreLink',
      label: 'See More Link (Optional)',
      type: 'text',
      admin: {
        description: 'Link to detailed page (e.g., /outing for outing details, /franchise for franchise details)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Is Active',
      defaultValue: false,
      required: false,
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      required: true,
    },
  ],
}
