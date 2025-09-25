import { Field } from 'payload'

export const faqSection: Field = {
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
}
