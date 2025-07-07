import { GlobalConfig } from 'payload'
import { appointmentSection } from '../fields/appointment-section'
import { faqSection } from '../fields/faq-section'

export const DeepTms: GlobalConfig = {
  slug: 'deep-tms',
  label: 'About Deep TMS',
  fields: [
    {
      name: 'deepTmsAboutSection',
      label: 'Deep TMS About Setion',
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
      name: 'deepTmsApproachSection',
      label: 'Deep TMS Approache Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          name: 'featureTable',
          label: 'Features Table',
          type: 'array',
          fields: [
            {
              name: 'feature',
              label: 'Feature',
              type: 'text',
            },
            {
              name: 'deepTms',
              label: 'Deep TMS',
              type: 'text',
            },
            {
              name: 'medicationTalkTherapy',
              label: 'MeMedication / Talk Therapy',
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
    appointmentSection,
    faqSection,
  ],
}
