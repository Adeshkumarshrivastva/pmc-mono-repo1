import type { CollectionConfig } from 'payload'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: {
    description: 'These are trial session appointments',
  },
  access: {
    create: () => false,
    update: () => false,
  },
  fields: [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
    },
    {
      name: 'service',
      label: 'Service',
      type: 'relationship',
      relationTo: 'services',
      hasMany: false,
    },
    {
      name: 'subService',
      label: 'Sub Service',
      type: 'relationship',
      relationTo: 'services',
      hasMany: false,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
    },
    {
      name: 'dateTime',
      label: 'Date and Time',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'd MMM yyy HH:mm',
          timeFormat: 'HH:mm',
        },
      },
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Amount in INR',
      },
    },
    {
      name: 'paymentStatus',
      label: 'Payment Status',
      type: 'select',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'unpaid',
      required: true,
    },
    {
      name: 'orderId',
      label: 'Order ID',
      type: 'text',
      required: false,
      admin: {
        description: 'Order ID from payment gateway',
      },
    },
  ],
  timestamps: true,
}
