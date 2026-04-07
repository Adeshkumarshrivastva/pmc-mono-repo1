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
      name: 'link',
      type: 'text',
      label: 'Link',
      required: false,
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
    {
      name: 'ctaText',
      label: 'Button Text',
      type: 'text',
      required: false,
      defaultValue: 'Grab the offer →',
    },
  ],
}
