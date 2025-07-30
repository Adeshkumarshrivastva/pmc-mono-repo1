import { GlobalConfig } from 'payload'

export const OurBlogs: GlobalConfig = {
  slug: 'our-blogs',
  label: 'Our Blogs',
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
}
