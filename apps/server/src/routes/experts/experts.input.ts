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
})

export const serviceSearchQuery = z.object({
  expertId: z.string().optional(),
  mode: z.enum(['IN_PERSON', 'VIRTUAL']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  tags: z.string().optional(),
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
  tags: true,
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
