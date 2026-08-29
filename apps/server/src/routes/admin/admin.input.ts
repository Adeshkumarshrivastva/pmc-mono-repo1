import z from 'zod'

export const createExpertInput = z.object({
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  name: z.string().min(3),
  type: z.enum([
    'PSYCHOLOGIST',
    'PSYCHIATRIST',
    'CLINICAL_PSYCHOLOGIST',
    'CONSULTANT_PHYSICIAN',
    'REHABILITATION_PSYCHOLOGIST',
    'COUNSELLING_PSYCHOLOGIST',
    'NEUROLOGIST',
    'GENERAL_PHYSICIAN',
    'OTHER',
  ]),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  professionalSnapshot: z.array(z.string()).default([]),
  education: z.array(z.object({ degree: z.string(), institution: z.string() })).default([]),
  professionalRegistration: z.string().optional(),
  whyChooseUs: z.array(z.string()).default([]),
  whatToExpect: z.array(z.string()).default([]),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
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
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  type: z.enum([
    'PSYCHOLOGIST',
    'PSYCHIATRIST',
    'CLINICAL_PSYCHOLOGIST',
    'CONSULTANT_PHYSICIAN',
    'REHABILITATION_PSYCHOLOGIST',
    'COUNSELLING_PSYCHOLOGIST',
    'NEUROLOGIST',
    'GENERAL_PHYSICIAN',
    'OTHER',
  ]),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  professionalSnapshot: z.array(z.string()).default([]),
  education: z.array(z.object({ degree: z.string(), institution: z.string() })).default([]),
  professionalRegistration: z.string().optional(),
  whyChooseUs: z.array(z.string()).default([]),
  whatToExpect: z.array(z.string()).default([]),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
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

export const createServiceForExpertInput = z.object({
  name: z.string().min(1, 'Service name is required'),
  slug: z.string().min(1, 'Slug is required'),
  availableModes: z.array(z.enum(['IN_PERSON', 'VIRTUAL'])).min(1, 'At least one mode is required'),
  paymentMode: z.enum(['ONLINE', 'OFFLINE']),
  inPersonLocation: z.any().optional(),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  description: z.string().default(''),
  bufferTimeBeforeInMinutes: z.number().min(0).default(30),
  bufferTimeAfterInMinutes: z.number().min(0).default(30),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('INR'),
  isPartialPaymentAvailable: z.boolean().default(false),
  minPaymentAmount: z.number().min(0).optional().default(0),
  durationInMinutes: z.number().min(15, 'Duration must be at least 15 minutes').default(60),
  tags: z.array(z.string()).default([]),
  additionalCharges: z
    .array(
      z.object({
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        price: z.number().min(1, 'Price is required'),
        description: z.string().min(1, 'Charge description is required'),
      }),
    )
    .optional(),
})

export type CreateServiceForExpertInput = z.infer<typeof createServiceForExpertInput>

export const updateServiceForExpertInput = createServiceForExpertInput.partial()

export type UpdateServiceForExpertInput = z.infer<typeof updateServiceForExpertInput>

export const bulkCreateBlockedDatesInput = z.object({
  dates: z.array(
    z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    }),
  ),
})

export type BulkCreateBlockedDatesInput = z.infer<typeof bulkCreateBlockedDatesInput>

export const reorderExpertsInput = z.object({
  activeId: z.string(),
  prevId: z.string().nullable(),
  nextId: z.string().nullable(),
})

export type ReorderExpertsInput = z.infer<typeof reorderExpertsInput>
