import type { CollectionConfig } from 'payload'

export const Internships: CollectionConfig = {
  slug: 'internships',
  admin: {
    useAsTitle: 'fullName',
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
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'text',
    },
    {
      name: 'schoolOrUniversity',
      label: 'School / University',
      type: 'text',
    },
    {
      name: 'degreeOrProgram',
      label: 'Degree / Program',
      type: 'text',
    },
    {
      name: 'interestedIn',
      label: 'Position / Role Interested In',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
    },
  ],
}
