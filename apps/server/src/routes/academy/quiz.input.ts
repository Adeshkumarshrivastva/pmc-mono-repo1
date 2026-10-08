import z from 'zod'

export const quizAnswersInput = z.object({
  // questionId -> selected option index
  answers: z.record(z.string(), z.number()).default({}),
})

export const finalAssessmentSubmitInput = z.object({
  answers: z.record(z.string(), z.number()).default({}),
  longAnswerText: z.string().default(''),
})

export const courseGroupInput = z.object({
  courseGroup: z.string().min(1, 'Course group is required'),
})

export type QuizAnswersInput = z.infer<typeof quizAnswersInput>
export type FinalAssessmentSubmitInput = z.infer<typeof finalAssessmentSubmitInput>
export type CourseGroupInput = z.infer<typeof courseGroupInput>
