import { GlobalConfig } from 'payload'
import { appointmentSection } from '../fields/appointment-section'
import { faqSection } from '../fields/faq-section'

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
          type: 'richText',
        },
        {
          name: 'heroSectionDescription',
          label: 'Hero Section Description',
          type: 'textarea',
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
        {
          name: 'heroSectionHeadline',
          label: 'Hero Section Headline',
          type: 'textarea',
        },
        {
          name: 'heroSectionDetails',
          label: 'Hero Section Details',
          type: 'array',
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
            },
            {
              name: 'value',
              label: 'Value',
              type: 'text',
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
          name: 'action',
          label: 'Action',
          type: 'text',
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
              name: 'background',
              label: 'Background',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Accent', value: 'accent' },
              ],
              defaultValue: 'primary',
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
            {
              name: 'stampImage',
              label: 'Stamp Image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'treatmentSection',
      label: 'Treatment Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'premaryImage',
          label: 'Primary Image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'secondryImage',
          label: 'Secondry Image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'text',
        },
        {
          name: 'action',
          label: 'Action',
          type: 'text',
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
            {
              name: 'feature',
              label: 'Feature',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'whyChooseSection',
      label: 'Why Choose Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'action',
          label: 'Action',
          type: 'text',
        },
        {
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'featuresCards',
          label: 'Features Cards',
          type: 'array',
          fields: [
            {
              name: 'featureTitle',
              label: 'Feature Title',
              type: 'text',
            },
            {
              name: 'featureDescription',
              label: 'Feature Description',
              type: 'textarea',
            },
            {
              name: 'featureIcon',
              label: 'Feature Icon',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'packagesSection',
      label: 'Packages Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Section Title',
          type: 'text',
        },
        {
          name: 'availablePackages',
          label: 'Available Packages',
          type: 'array',
          fields: [
            {
              name: 'name',
              label: 'Package Name',
              type: 'text',
            },
            {
              // TODO: Rename it to pricing
              name: 'price',
              label: 'Package Pricing',
              type: 'group',
              fields: [
                { name: 'price', label: 'Price', type: 'text' },
                { name: 'unitText', label: 'Unit Text', type: 'text' },
              ],
            },
            {
              name: 'description',
              label: 'Package Description',
              type: 'textarea',
            },
            {
              name: 'featureHeadline',
              label: 'Package Features Headline',
              type: 'text',
            },
            {
              name: 'features',
              label: 'Package Features',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  label: 'Feature Title',
                  type: 'text',
                },
              ],
            },
            {
              name: 'action',
              label: 'Package Action Button Text',
              type: 'text',
            },
          ],
        },
      ],
    },
    appointmentSection,
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
    faqSection,
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
