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

export type ExpertSearchQuery = z.infer<typeof expertSearchQuery>

export type SortBy = NonNullable<ExpertSearchQuery['sortBy']>

export const EXPERT_SERVICE_SELECT_FIELDS = {
  id: true,
  name: true,
  durationInMinutes: true,
  price: true,
  currency: true,
  availableModes: true,
  city: true,
  country: true,
} satisfies Prisma.ServiceSelect

export type ExpertSearchResponse = Prisma.ExpertGetPayload<{
  include: { servicesProvided: { select: typeof EXPERT_SERVICE_SELECT_FIELDS } }
}>

export const expertMonthlyAvailableSlotsQuery = z.object({
  serviceId: z.string(),
  expertId: z.string(),
  month: z.number().min(0).max(11),
  year: z.number(),
})

export type ExpertMonthlyAvailableSlotsQuery = z.infer<typeof expertMonthlyAvailableSlotsQuery>
