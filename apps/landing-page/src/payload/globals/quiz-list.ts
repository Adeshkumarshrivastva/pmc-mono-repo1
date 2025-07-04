import { GlobalConfig } from 'payload'

export const QuizList: GlobalConfig = {
  slug: 'quiz-list',
  label: 'Quiz List',
  fields: [
    {
      name: 'quizList',
      label: 'Quiz List',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'quizQuestionAndAnswer',
          label: 'Quiz Question And Answer',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'question',
              label: 'Question',
              type: 'text',
              required: true,
            },
            {
              name: 'answer',
              label: 'Answer',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'answer',
                  label: 'Answer',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
