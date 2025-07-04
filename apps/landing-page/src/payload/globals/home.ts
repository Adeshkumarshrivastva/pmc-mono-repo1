import { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  fields: [
    {
      name: 'heroSetion',
      label: 'Hero Setion',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'heroSectionTitle',
          label: 'Hero Section Title',
          type: 'text',
          required: true,
        },
        {
          name: 'heroSectionDescription',
          label: 'Hero Section Description',
          type: 'richText',
          required: true,
        },
        {
          name: 'heroSectionImage',
          label: 'Hero Section Image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'heroSectionAction',
          label: 'Hero Section Action',
          type: 'text',
          required: true,
        },
        // TODO: add feature section title, description, action
        {
          name: 'features',
          label: 'Features',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'featureTitle',
              label: 'Feature Title',
              type: 'text',
            },
            // TODO: add feature description, feature icon, feature image (optional)
            {
              name: 'featureBackground',
              label: 'Feature Background',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Accent', value: 'accent' },
              ],
              defaultValue: 'primary',
            },
          ],
        },
      ],
    },
    {
      name: 'deepTmsSection',
      label: 'Deep Tms Section',
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
          name: 'deepTmsFeatures',
          label: 'Deep TMS Features',
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
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'isThisTreatmentRightYouSection',
      label: 'Is This Treatment Right You Section',
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
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
          required: true,
        },
        {
          name: 'featureList',
          label: 'Features List',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    //TODO: Why Choose Us Section
    {
      name: 'whyChooseUsSection',
      label: 'Why Choose Us Section',
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
          name: 'feature',
          label: 'Features',
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
              name: 'description',
              label: 'Description',
              type: 'textarea',
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
      name: 'packageSection',
      label: 'Package / Pricing Section',
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
          name: 'featurePackage',
          label: 'Features Package',
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
              name: 'price',
              label: 'Price',
              type: 'number',
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
      name: 'testimonialSection',
      label: 'Testimonial Section',
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
          name: 'testimonialSlides',
          label: 'Testimonial Slides',
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
              name: 'quote',
              label: 'Quote',
              type: 'text',
              required: true,
            },
            {
              name: 'quoteAuthor',
              label: 'Quote Author',
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
    {
      name: 'blogsSection',
      label: 'Blogs Section',
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
          name: 'blogsFeature',
          label: 'Blogs Feature',
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
              name: 'description',
              label: 'Description',
              type: 'richText',
              required: true,
            },
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
            },
            {
              name: 'date',
              label: 'Date',
              type: 'date',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
