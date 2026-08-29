import type { GlobalConfig } from 'payload'
import { expertsSection } from '../fields/experts-section'
import { contactSection } from '../fields/contact-section'

export const AboutUs: GlobalConfig = {
  slug: 'about-us',
  access: {
    read: () => true,
  },
  label: 'About Us',
  fields: [
    {
      name: 'aboutUsHeroSection',
      label: 'About Us Hero Section',
      type: 'group',
      fields: [
        {
          name: 'preHeader',
          label: 'Pre Header',
          type: 'text',
        },
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },

        {
          name: 'overlayContent',
          label: 'Overlay Content',
          type: 'group',
          fields: [
            {
              name: 'overlayImage',
              label: 'Overlay Image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heading',
              label: 'Overlay Heading',
              type: 'text',
            },
            {
              name: 'description',
              label: 'Overlay Description',
              type: 'textarea',
            },
            {
              name: 'statistics',
              label: 'Statistics',
              type: 'array',
              fields: [
                {
                  name: 'value',
                  label: 'Value',
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'label',
                  label: 'Label',
                  type: 'text',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'whatWeDoSection',
      label: 'What We Do Section',
      type: 'group',
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'text',
          required: true,
          defaultValue: 'What We Do',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'richText',
        },
        {
          name: 'featureCards',
          label: 'Feature Cards',
          type: 'array',
          admin: {
            description: 'The two cards that appear on the left and right of the image.',
          },
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'description',
              type: 'richText',
            },
            {
              name: 'image',
              label: 'Image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'missionVisionStory',
      label: 'Mission, Vision & Story',
      type: 'group',
      fields: [
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Purpose (Mission & Vision)',
              fields: [
                {
                  name: 'purposeHeading',
                  label: 'Heading Quote',
                  type: 'textarea',
                },
                {
                  name: 'mission',
                  label: 'Mission',
                  type: 'group',
                  fields: [
                    {
                      name: 'heading',
                      type: 'text',
                    },
                    {
                      name: 'description',
                      type: 'richText',
                    },
                  ],
                },
                {
                  name: 'vision',
                  label: 'Vision',
                  type: 'group',
                  fields: [
                    {
                      name: 'heading',
                      type: 'text',
                    },
                    {
                      name: 'description',
                      type: 'richText',
                    },
                  ],
                },
              ],
            },
            {
              label: 'Company Story',
              fields: [
                {
                  name: 'storyIntro',
                  label: 'Heading Quote',
                  type: 'text',
                },
                {
                  name: 'storyContent',
                  label: 'Story Content',
                  type: 'group',
                  fields: [
                    {
                      name: 'heading',
                      type: 'text',
                    },
                    {
                      name: 'story',
                      label: 'Story',
                      type: 'richText',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'teamMembersSection',
      label: 'Team Members Section',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Section Title',
          type: 'text',
        },
        {
          name: 'members',
          label: 'Members',
          type: 'relationship',
          relationTo: 'team-members',
          hasMany: true,
        },
      ],
    },
    expertsSection,
    {
      name: 'opportunitiesSection',
      label: 'Opportunities Section',
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
          name: 'description',
          label: 'Descitption',
          type: 'richText',
        },
        {
          name: 'action',
          label: 'Action',
          type: 'text',
        },
        {
          name: 'subAction',
          label: 'Sub Action',
          type: 'text',
        },
      ],
    },
    contactSection,
  ],
}
