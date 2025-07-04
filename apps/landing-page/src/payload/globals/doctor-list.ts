import { GlobalConfig } from 'payload'

export const DoctorList: GlobalConfig = {
  slug: 'doctor-list',
  label: 'Doctor List',
  fields: [
    {
      name: 'doctorList',
      label: 'Doctor List',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
        },
        {
          name: 'drProfileInformation',
          label: 'Dr. Profile Information',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'profileImage',
              label: 'Dr. Image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'name',
              label: 'Dr. Name',
              type: 'text',
              required: true,
            },
            {
              name: 'designation',
              label: 'Dr. Designation',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'richText',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
