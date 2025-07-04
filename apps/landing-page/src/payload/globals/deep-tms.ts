import { GlobalConfig } from 'payload'

export const DeepTms: GlobalConfig = {
  slug: 'deep-tms',
  label: 'Deep TMS',
  fields: [
    {
      name: 'powersLastingMentalReliefSetion',
      label: 'Powers Lasting Mental Relief Setion',
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
          name: 'description',
          label: 'Description',
          type: 'richText',
          required: true,
        },
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'stat',
          label: 'Stat List',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              label: 'value',
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
    {
      name: 'DeepTmsWorkSection',
      label: 'Deep TMS Work Section',
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
          name: 'howDoesDeepTmsWork',
          label: 'How Does Deep TMS Work?',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'deepTraditionalApproachesSection',
      label: 'Deep TMS vs Traditional Approaches Section',
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
          name: 'featureList',
          label: 'Feature Table',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'feature',
              label: 'Feature',
              type: 'text',
              required: true,
            },
            {
              name: 'deepTms',
              label: 'Deep TMS',
              type: 'text',
              required: true,
            },
            {
              name: 'medicationTalkTherapy',
              label: 'MeMedication / Talk Therapy',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'isDeepRightYou',
      label: 'Is Deep TMS Right for You?',
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
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'text',
          required: true,
        },
        {
          name: 'benefits',
          label: 'Benefits List',
          type: 'array',
          minRows: 1,
          required: true,
          fields: [
            {
              name: 'text',
              label: 'Add Benefit',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'professionalsTeamSection',
      label: 'Professionals Team Section',
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
          name: 'profileInformationreTeam',
          label: 'Profile Information',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'profileImage',
              label: 'Profile Image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
            },
            {
              name: 'designation',
              label: 'Designation',
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
    {
      name: 'appointmentSection',
      label: 'Appointment Section',
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
          name: 'contacts',
          label: 'contacts',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'phone',
              label: 'phone',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
          required: true,
        },
        {
          name: 'socialLinks',
          label: 'Social Links',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'platform',
              label: 'Platform',
              type: 'select',
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'X (Twitter)', value: 'x' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
              ],
              required: true,
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'faqSection',
      label: 'FAQ Section',
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
          name: 'faqQuestionsAndAnswer',
          label: 'FAQ Questions And Answer',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'question',
              label: 'Question',
              type: 'text',
              required: true,
            },
            {
              name: 'answer',
              label: 'Answer',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
