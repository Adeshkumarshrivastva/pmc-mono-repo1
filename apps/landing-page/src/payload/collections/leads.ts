import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'phone', 'status', 'leadLevel', 'source'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
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
      name: 'source',
      label: 'Source',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Website', value: 'website' },
        { label: 'Clinic', value: 'clinic' },
        { label: 'Referral', value: 'referral' },
        { label: 'Ads', value: 'ads' },
        { label: 'Others', value: 'other' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Follow-up', value: 'followUp' },
        { label: 'Interested', value: 'interested' },
        { label: 'Converted', value: 'converted' },
        { label: 'Lost', value: 'lost' },
      ],
      defaultValue: 'new',
    },
    {
      name: 'leadLevel',
      label: 'Lead Level',
      type: 'select',
      options: [
        { label: 'Hot', value: 'hot' },
        { label: 'Warm', value: 'warm' },
        { label: 'Cold', value: 'cold' },
      ],
    },
  ],
  timestamps: true,
}
