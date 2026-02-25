import type { GlobalConfig } from 'payload'
import { contactSection } from '../fields/contact-section'
import { faqSection } from '../fields/faq-section'
import { expertsSection } from '../fields/experts-section'
import { testimonialSection } from '../fields/testimonial-section'
import { serivicesSection } from '../fields/services-section'
import { achievementSection } from '../fields/achievement-section'
import { quizSection } from '../fields/quiz-section'
import { mapSection } from '../fields/map-section'
import { webinarsSection } from '../fields/webinars-section'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  fields: [
    {
      name: 'bookingSection',
      label: 'Booking Section',
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
          type: 'textarea',
        },
        {
          name: 'bookingSectionImage',
          label: 'Booking Section Image',
          type: 'relationship',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'meterSection',
      label: 'Meter Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'richText',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
        {
          name: 'meters',
          label: 'Meters',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'href',
              label: 'Link',
              type: 'text',
            },
            {
              name: 'meterImage',
              label: 'Meter Image',
              type: 'relationship',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
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
          name: 'heroSectionHeadline1',
          label: 'Hero Section Headline 1',
          type: 'textarea',
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
        {
          name: 'videoUrl',
          label: 'Deep TMS Video URL',
          type: 'text',
        },
      ],
    },
    {
      name: 'wellnessSection',
      label: 'Wellness Services Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'text',
        },
        {
          name: 'topRow',
          label: 'Top Row Cards',
          type: 'array',
          maxRows: 3,
          fields: [
            {
              name: 'icon',
              label: 'Icon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
            },
            {
              name: 'subHeading',
              label: 'Sub Heading',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
            },
          ],
        },
        {
          name: 'bottomRow',
          label: 'Bottom Row Cards',
          type: 'array',
          maxRows: 3,
          fields: [
            {
              name: 'icon',
              label: 'Icon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
            },
            {
              name: 'subHeading',
              label: 'Sub Heading',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'cardSection',
      label: 'Card Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'text',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
        {
          name: 'cardHeading',
          label: 'Card Heading',
          type: 'text',
        },
        {
          name: 'cardSubHeading',
          label: 'Card Sub Heading',
          type: 'text',
        },
        {
          name: 'cardImage',
          label: 'Card Image',
          type: 'relationship',
          relationTo: 'media',
        },
      ],
    },
    webinarsSection,
    {
      name: 'academySection',
      label: 'Academy Section',
      type: 'group',
      fields: [
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'text',
          defaultValue: 'BEST PLACE FOR LEARNING',
        },
        {
          name: 'title',
          label: 'Main Title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
        },
        {
          name: 'leftImage',
          label: 'Left Image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'rightImage',
          label: 'Right Image',
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
              name: 'featureIcon',
              label: 'Feature Icon',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          name: 'button1',
          label: 'botton1 text',
          type: 'text',
        },
        {
          name: 'href1',
          label: 'Button1 Link',
          type: 'text',
        },
        {
          name: 'button2',
          label: 'botton2 text',
          type: 'text',
        },
        {
          name: 'href2',
          label: 'Button2 Link',
          type: 'text',
        },
        {
          name: 'stats',
          label: 'Stats Section',
          type: 'group',
          fields: [
            {
              name: 'stats',
              label: 'stats',
              type: 'array',
              fields: [
                {
                  name: 'number',
                  label: 'Number',
                  type: 'text',
                },
                {
                  name: 'label',
                  label: 'Label',
                  type: 'text',
                },
                {
                  name: 'icon',
                  label: 'Icon',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
      ],
    },
    serivicesSection,
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
          name: 'imageCaption',
          label: 'Image Caption',
          type: 'text',
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
    mapSection,
    contactSection,
    testimonialSection,
    achievementSection,
    {
      name: 'partnersSection',
      label: 'Partners Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Section Title',
          type: 'text',
          required: true,
        },
        {
          name: 'universityPartners',
          label: 'University Partners',
          type: 'array',
          fields: [
            {
              name: 'logo',
              label: 'University Logo',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        {
          name: 'hospitalPartners',
          label: 'Hospital Partners',
          type: 'array',
          fields: [
            {
              name: 'logo',
              label: 'Hospital Logo',
              type: 'upload',
              relationTo: 'media',
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
      fields: [
        {
          name: 'title',
          label: 'Section Title',
          type: 'text',
        },
        {
          name: 'action',
          label: 'Action Button Text',
          type: 'text',
        },
        {
          name: 'featuredBlogs',
          label: 'Featured Blog Posts',
          relationTo: 'blog',
          type: 'relationship',
          hasMany: true,
          maxRows: 3,
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
    expertsSection,
    quizSection,
    faqSection,
  ],
}
