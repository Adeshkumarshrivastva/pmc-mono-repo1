import z from 'zod'

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
