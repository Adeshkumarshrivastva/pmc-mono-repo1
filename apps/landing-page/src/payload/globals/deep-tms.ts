import type { GlobalConfig } from 'payload'
import { appointmentSection } from '../fields/appointment-section'
import { faqSection } from '../fields/faq-section'
import { serivicesSection } from '../fields/services-section'

export const DeepTms: GlobalConfig = {
  slug: 'deep-tms',
  label: 'About Deep TMS',
  fields: [
    {
      name: 'deepTmsHeroSection',
      label: 'Deep TMS Hero Setion',
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
          name: 'image',
          label: 'Image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'videoUrl',
          label: 'Deep TMS Video URL',
          type: 'text',
        },
        {
          name: 'statCards',
          label: 'Stat Cards',
          type: 'array',
          fields: [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
            },
            {
              name: 'value',
              label: 'value',
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
      name: 'deepTmsWorkSection',
      label: 'Deep TMS Work Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'deepTmsWorkCards',
          label: 'Deep TMS Work Cards',
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
              name: 'description',
              label: 'Description',
              type: 'richText',
            },
          ],
        },
      ],
    },
    {
      name: 'deepTmsComparisonSection',
      label: 'Deep TMS vs Traditional Method Table Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'featureParameterColumn',
          label: 'Feature Parameter Column',
          type: 'group',
          fields: [
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
            },
            {
              name: 'background',
              label: 'Background',
              type: 'select',
              options: [
                { label: 'Card', value: 'card' },
                { label: 'Card Foreground', value: 'card-foreground' },
              ],
              defaultValue: 'card',
            },
            {
              name: 'textColor',
              label: 'Text Color',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Primary Foreground', value: 'primary-foreground' },
              ],
              defaultValue: 'primary-foreground',
            },
          ],
        },
        {
          name: 'deepTmsFeatureColumn',
          label: 'Deep TMS Feature Column',
          type: 'group',
          fields: [
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
            },
            {
              name: 'background',
              label: 'Background',
              type: 'select',
              options: [
                { label: 'Card', value: 'card' },
                { label: 'Card Foreground', value: 'card-foreground' },
              ],
              defaultValue: 'card-foreground',
            },
            {
              name: 'textColor',
              label: 'Text Color',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Primary Foreground', value: 'primary-foreground' },
              ],
              defaultValue: 'primary',
            },
          ],
        },
        {
          name: 'traditionalFeatureColumn',
          label: 'Traditional Feature Column',
          type: 'group',
          fields: [
            {
              name: 'heading',
              label: 'Heading',
              type: 'text',
            },
            {
              name: 'background',
              label: 'Background',
              type: 'select',
              options: [
                { label: 'Card', value: 'card' },
                { label: 'Card Foreground', value: 'card-foreground' },
              ],
              defaultValue: 'card',
            },
            {
              name: 'textColor',
              label: 'Text Color',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Primary Foreground', value: 'primary-foreground' },
              ],
              defaultValue: 'primary-foreground',
            },
          ],
        },
        {
          name: 'comparisonRows',
          label: 'Feature Comparison Rows',
          type: 'array',
          fields: [
            {
              name: 'feature',
              label: 'Feature Parameter',
              type: 'text',
            },
            {
              name: 'deepTmsFeature',
              label: 'Deep TMS Feature Value',
              type: 'text',
            },
            {
              name: 'traditionalFeature',
              label: 'Traditional Feature Value',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'deepTmsEligibilitySection',
      label: 'Deep TMS Eligibility Section',
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
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'subTitle',
          label: 'Sub Title',
          type: 'text',
        },
        {
          name: 'eligibilityList',
          label: 'Eligibility List',
          type: 'array',
          fields: [
            {
              name: 'addEligibility',
              label: 'Add Eligibility',
              type: 'text',
            },
          ],
        },
        {
          name: 'action',
          label: 'Action',
          type: 'text',
        },
      ],
    },
    serivicesSection,
    appointmentSection,
    faqSection,
  ],
}
