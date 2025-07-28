import { z } from 'zod/v4'

const baseQuestion = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean().default(false),
  errorMessage: z.string().nullable(),
})

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const multiSelectSchema = baseQuestion.extend({
  type: z.literal('multiSelect'),
  options: z.array(optionSchema),
})

const singleSelectSchema = baseQuestion.extend({
  type: z.literal('singleSelect'),
  options: z.array(optionSchema),
})

export const questionSchema = z.discriminatedUnion('type', [multiSelectSchema, singleSelectSchema])
export type Question = z.infer<typeof questionSchema>
export type Questionnaire = Question[]

export const singleSelectAnswer = z.string().min(1)
export const multiSelectAnswer = z.array(z.string()).min(1)

export const answerSchema = z.discriminatedUnion('type', [
  z.object({ type: 'singleSelect', value: singleSelectAnswer }),
  z.object({ type: 'multiSelect', value: multiSelectAnswer }),
])
export type Answer = z.infer<typeof answerSchema>

export const answerValidationMap: Record<'singleSelect' | 'multiSelect', z.ZodType> = {
  singleSelect: singleSelectAnswer,
  multiSelect: multiSelectAnswer,
}

export const questionnaire: Questionnaire = [
  {
    id: 'q1',
    title: 'Who will be receiving care?',
    type: 'multiSelect',
    required: true,
    options: [
      { label: 'Me', value: 'me' },
      { label: 'My child', value: 'my-child' },
      { label: 'My partner and me', value: 'my-partner-and-me' },
      { label: 'My family', value: 'my-family' },
      { label: 'My friend', value: 'my-friend' },
      { label: 'My relative', value: 'my-relative' },
    ],
    errorMessage: 'Choose a service type. You can always change this later.',
  },
  {
    id: 'q2',
    title: 'What brings you here today?',
    type: 'multiSelect',
    required: true,
    options: [
      { label: 'Depression', value: 'depression' },
      { label: 'Anxiety', value: 'anxiety' },
      { label: 'OCD', value: 'ocd' },
      { label: 'Addiction', value: 'addiction' },
      { label: 'Other / Not sure', value: 'other-not-sure' },
    ],
    errorMessage: 'Please share your preferences.',
  },
  {
    id: 'q3',
    title: 'Have you tried medication or talk therapy for this before?',
    type: 'singleSelect',
    required: true,
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    errorMessage: 'Select an option before moving on: You can always change this later.',
  },
  {
    id: 'q4',
    title: 'How would you describe your experience?',
    type: 'multiSelect',
    required: true,
    options: [
      { label: 'Helped somewhat, but not enough', value: 'helped-somewhat-but-not-enough' },
      { label: 'Had no improvement', value: 'had-no-improvement' },
      { label: 'Caused side effects', value: 'caused-side-effects' },
    ],
    errorMessage: 'Please share your preferences.',
  },
  {
    id: 'q5',
    title: 'How severe are your current symptoms?',
    type: 'multiSelect',
    required: true,
    options: [
      { label: 'Mood / Interest', value: 'mood-interest' },
      { label: 'Anxiety / Worry', value: 'anxiety-worry' },
      { label: 'Compulsions or intrusive thoughts', value: 'compulsions-or-intrusive-thoughts' },
    ],
    errorMessage: 'Please share your preferences.',
  },
  {
    id: 'q6',
    title: 'Which of these sounds most like you?',
    type: 'multiSelect',
    required: true,
    options: [
      { label: "I've been struggling for months or years", value: 'struggling-for-months-or-years' },
      { label: "I'd like a quick, non-drug alternative", value: 'quick-non-drug-alternative' },
      { label: 'I want a doctor-guided, science-based solution', value: 'doctor-guided-science-based-solution' },
      { label: "I'm comfortable coming to a clinic", value: 'comfortable-coming-to-clinic' },
    ],
    errorMessage: 'Please share your preferences.',
  },
  {
    id: 'q7',
    title: 'Would you like to explore Deep TMS?',
    type: 'singleSelect',
    required: true,
    options: [
      { label: "Yes, let's talk to someone", value: 'yes-talk-to-someone' },
      { label: "I'd like more info first", value: 'more-info-first' },
      { label: 'Not right now', value: 'not-right-now' },
    ],
    errorMessage: 'Select an option before moving on: You can always change this later.',
  },
]

export const defaultAnswers = questionnaire.reduce(
  (acc, question) => {
    if (question.type === 'multiSelect') {
      acc[question.id] = []
    } else if (question.type === 'singleSelect') {
      acc[question.id] = ''
    }
    return acc
  },
  {} as Record<string, unknown>,
)
