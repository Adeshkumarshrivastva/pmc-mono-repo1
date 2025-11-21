import type { GlobalConfig } from 'payload'

export const QuizPage: GlobalConfig = {
  slug: 'quiz-page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heading',
      label: 'Main Heading',
      type: 'text',
      defaultValue: 'Free Mental Health Assessments',
      required: true,
    },
    {
      name: 'subtitle1',
      label: 'Subtitle 1',
      type: 'text',
      defaultValue: 'Join our community and get access to exclusive content on mental wellness.',
    },
    {
      name: 'subtitle2',
      label: 'Subtitle 2',
      type: 'text',
      defaultValue: 'Take a free test and get your report.',
    },
  ],
}
