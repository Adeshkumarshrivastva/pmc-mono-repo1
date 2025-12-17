import z from 'zod'
import type { Prisma } from '../../generated/prisma'

export const expertSearchQuery = z.object({
  type: z.enum(['PSYCHOLOGIST', 'PSYCHIATRIST', 'CLINICAL_PSYCHOLOGIST']).optional(),
  serviceMode: z.enum(['IN_PERSON', 'VIRTUAL']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['price', 'rating', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  expertise: z
    .union([
      z.string().array(),
      z.string().transform((val) =>
        val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ])
    .optional(),
  search: z.string().optional(),
})

export const serviceSearchQuery = z.object({
  expertId: z.string().optional(),
  mode: z.enum(['IN_PERSON', 'VIRTUAL']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  location: z.string().optional(),
  minDuration: z.coerce.number().optional(),
  maxDuration: z.coerce.number().optional(),
  sortBy: z.enum(['price', 'duration', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ExpertSearchQuery = z.infer<typeof expertSearchQuery>
export type ServiceSearchQuery = z.infer<typeof serviceSearchQuery>

export type SortBy = NonNullable<ExpertSearchQuery['sortBy']>
export type ServiceSortBy = NonNullable<ServiceSearchQuery['sortBy']>

export const EXPERT_SERVICE_SELECT_FIELDS = {
  id: true,
  name: true,
  durationInMinutes: true,
  price: true,
  currency: true,
  availableModes: true,
  city: true,
  country: true,
  slug: true,
} satisfies Prisma.ServiceSelect

export const EXPERT_SELECT_FIELDS = {
  id: true,
  slug: true,
  name: true,
  type: true,
  timezone: true,
  city: true,
  country: true,
  avgRating: true,
  bio: true,
  qualifications: true,
  createdAt: true,
  updatedAt: true,
  gender: true,
  expertise: true,
  user: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
} satisfies Prisma.ExpertSelect

export const SERVICE_SELECT_FIELDS = {
  id: true,
  name: true,
  availableModes: true,
  inPersonLocation: true,
  city: true,
  country: true,
  price: true,
  currency: true,
  isPartialPaymentAvailable: true,
  minPaymentAmount: true,
  durationInMinutes: true,

  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceSelect

export type ExpertSearchResponse = Prisma.ExpertGetPayload<{
  include: { servicesProvided: { select: typeof EXPERT_SERVICE_SELECT_FIELDS } }
}>

export const expertMonthlyAvailableSlotsQuery = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number(),
})

export type ExpertMonthlyAvailableSlotsQuery = z.infer<typeof expertMonthlyAvailableSlotsQuery>

export const expertBookingsSearchQuery = z.object({
  period: z.enum(['upcoming', 'past', 'fixed']),
  // startDate and endDate are only for fixed period
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
})

export type ExpertBookingsSearchQuery = z.infer<typeof expertBookingsSearchQuery>

export const createPrescriptionInput = z.object({
  bookingId: z.string(),
  medicines: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      instructions: z.string().optional(),
    }),
  ),
  notes: z.string().optional(),
})

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionInput>

export const updatePrescriptionInput = createPrescriptionInput.partial().extend({
  prescriptionId: z.string(),
})

export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionInput>

export const medicineSchema = z.object({
  name: z.string(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
})

export type Medicine = z.infer<typeof medicineSchema>

export const expertProfileInput = z.object({
  name: z.string().min(3),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  expertise: z.array(z.string()),
})

export type ExpertProfileInput = z.infer<typeof expertProfileInput>

export const updatePaymentStatusInput = z.object({
  status: z.enum(['PENDING', 'COMPLETED']),
})

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusInput>
