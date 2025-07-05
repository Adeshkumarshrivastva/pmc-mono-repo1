import { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  fields: [
    {
      name: 'heroSetion',
      label: 'Hero Setion',
      type: 'group',
      fields: [
        {
          name: 'heroSectionTitle',
          label: 'Hero Section Title',
          type: 'text',
        },
        {
          name: 'heroSectionDescription',
          label: 'Hero Section Description',
          type: 'richText',
        },
        {
          name: 'heroSectionImage',
          label: 'Hero Section Image',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'heroSectionAction',
          label: 'Hero Section Action',
          type: 'text',
        },
        // TODO: add feature section title, description, action
        {
          name: 'features',
          label: 'Features',
          type: 'array',
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
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },
        {
          name: 'deepTmsFeatures',
          label: 'Deep TMS Features',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
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
            },
          ],
        },
      ],
    },
    {
      name: 'isThisTreatmentRightYouSection',
      label: 'Is This Treatment Right You Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'image',
          label: 'Image',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },
        {
          name: 'featureList',
          label: 'Features List',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
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
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'feature',
          label: 'Features',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
            },
          ],
        },
      ],
    },
    {
      name: 'professionalsTeamSection',
      label: 'Professionals Team Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'profileInformationreTeam',
          label: 'Profile Information',
          type: 'array',
          fields: [
            {
              name: 'profileImage',
              label: 'Profile Image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'name',
              label: 'Name',
              type: 'text',
            },
            {
              name: 'designation',
              label: 'Designation',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'richText',
            },
          ],
        },
      ],
    },
    {
      name: 'packageSection',
      label: 'Package / Pricing Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'featurePackage',
          label: 'Features Package',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'price',
              label: 'Price',
              type: 'number',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'richText',
            },
          ],
        },
      ],
    },
    {
      name: 'appointmentSection',
      label: 'Appointment Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'contacts',
          label: 'contacts',
          type: 'array',
          fields: [
            {
              name: 'phone',
              label: 'phone',
              type: 'text',
            },
          ],
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
        },
        {
          name: 'socialLinks',
          label: 'Social Links',
          type: 'array',
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
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'testimonialSection',
      label: 'Testimonial Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'testimonialSlides',
          label: 'Testimonial Slides',
          type: 'array',
          fields: [
            {
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'quote',
              label: 'Quote',
              type: 'text',
            },
            {
              name: 'quoteAuthor',
              label: 'Quote Author',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'faqSection',
      label: 'FAQ Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'faqQuestionsAndAnswer',
          label: 'FAQ Questions And Answer',
          type: 'array',
          fields: [
            {
              name: 'question',
              label: 'Question',
              type: 'text',
            },
            {
              name: 'answer',
              label: 'Answer',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'blogsSection',
      label: 'Blogs Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'blogsFeature',
          label: 'Blogs Feature',
          type: 'array',
          fields: [
            {
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'richText',
            },
            {
              name: 'name',
              label: 'Name',
              type: 'text',
            },
            {
              name: 'date',
              label: 'Date',
              type: 'date',
            },
          ],
        },
      ],
    },
  ],
}
