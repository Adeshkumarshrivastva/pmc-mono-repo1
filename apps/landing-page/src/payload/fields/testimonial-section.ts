import { Field } from 'payload'

export const testimonialSection: Field = {
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
      type: 'relationship',
      relationTo: 'testimonial',
      hasMany: true,
    },
  ],
}
