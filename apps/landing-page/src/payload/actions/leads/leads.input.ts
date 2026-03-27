import { z } from 'zod'
import { objectId } from '@/lib/validation'

export const leadFormInput = z.object({
  fullName: z.string().min(1),
  email: z.email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1),
  service: z.string(),
  message: z.string().optional().or(z.literal('')),
})

export type LeadFormInput = z.infer<typeof leadFormInput>

export const quizLeadInput = z.object({
  fullName: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().min(10).max(15),
  quizId: objectId,
  quizName: z.string(),
  quizAnswers: z
    .array(
      z.object({
        questionId: z.string().optional(),
        question: z.string().optional(),
        answer: z.string().optional(),
      }),
    )
    .optional(),
})

export type QuizLeadFormInput = z.infer<typeof quizLeadInput>

export const franchiseFormInput = z.object({
  fullName: z.string().min(1),
  email: z.email('Invalid email address').optional().or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 characters')
    .regex(/^(?:\+91|91|0)?\s?(?:\d{10}|\d{5}\s\d{5})$/, 'Invalid phone number format'),
  message: z.string().optional().or(z.literal('')),
})

export type FranchiseFormInput = z.infer<typeof franchiseFormInput>
