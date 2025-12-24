import z from 'zod'

export const createExpertInput = z.object({
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  name: z.string().min(3),
  type: z.enum(['PSYCHOLOGIST', 'PSYCHIATRIST', 'CLINICAL_PSYCHOLOGIST', 'CONSULTANT_PHYSICIAN', 'REHABILITATION_PSYCHOLOGIST']),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  expertise: z.array(z.string()),
  experienceInYears: z.number().int().min(0).optional(),
  photoId: z.string().optional(),
})

export type CreateExpertInput = z.infer<typeof createExpertInput>

export const updateExpertInfoInput = z.object({
  name: z.string().min(3),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  expertise: z.array(z.string()),
  photoId: z.string().optional(),
  experienceInYears: z.number().int().min(0).optional(),
})

export type UpdateExpertInfoInput = z.infer<typeof updateExpertInfoInput>

export const updateAvailabilityInput = z.object({
  days: z.array(
    z.object({
      dayIndex: z.number().min(0).max(6),
      ranges: z.array(
        z.object({
          startMinutes: z.number(),
          endMinutes: z.number(),
        }),
      ),
    }),
  ),
})

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilityInput>
