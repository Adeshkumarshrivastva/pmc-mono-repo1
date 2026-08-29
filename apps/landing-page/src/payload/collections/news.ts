import type { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt'],
  },
  access: {
    create: () => true,
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      admin: {
        description: 'Headline of the press release (added once, shared by all PRs below)',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published At',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'prs',
      type: 'array',
      label: 'PR Entries',
      labels: {
        singular: 'PR Entry',
        plural: 'PR Entries',
      },
      minRows: 1,
      admin: {
        description: 'Add one entry per media outlet this PR was published on',
      },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          label: 'Logo',
          relationTo: 'media',
          admin: {
            description: 'Logo of the media outlet',
          },
        },
        {
          name: 'media',
          type: 'text',
          label: 'Media',
          required: true,
          admin: {
            description: 'Name of the media outlet (e.g., UP 18 News)',
          },
        },
        {
          name: 'mediaType',
          type: 'text',
          label: 'Media Type',
          admin: {
            description: 'e.g., News Portal',
          },
        },
        {
          name: 'industry',
          type: 'text',
          label: 'Industry',
          admin: {
            description: 'e.g., Information, Business',
          },
        },
        {
          name: 'visitingCountry',
          type: 'text',
          label: 'Top 3 Visiting Country',
          admin: {
            description: 'e.g., IN or IN,US',
          },
        },
        {
          name: 'potentialAudience',
          type: 'text',
          label: 'Potential Audiences',
          admin: {
            description: 'e.g., 104760 visit/month',
          },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link',
          required: true,
          admin: {
            description: 'External URL this PR card should open (e.g., https://example.com/article)',
          },
        },
      ],
    },
  ],
}
