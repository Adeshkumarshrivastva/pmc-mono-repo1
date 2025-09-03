import { match } from 'ts-pattern'
import type { Prisma } from '../../generated/prisma'
import { type C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import {
  EXPERT_SERVICE_SELECT_FIELDS,
  type ExpertSearchQuery,
  type SortBy,
  type ExpertSearchResponse,
} from './experts.input'

export async function getExperts(c: C, query: ExpertSearchQuery) {
  try {
    const { page, limit } = query
    const skip = (page - 1) * limit

    const whereClause: Prisma.ExpertWhereInput = {}

    if (query.type) {
      whereClause.type = query.type
    }

    if (query.timezone) {
      whereClause.timezone = query.timezone
    }

    const serviceFilters: Prisma.ServiceWhereInput = {}

    if (query.serviceMode) {
      serviceFilters.availableModes = { has: query.serviceMode }
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      serviceFilters.price = {}
      if (query.minPrice !== undefined) {
        serviceFilters.price.gte = query.minPrice
      }
      if (query.maxPrice !== undefined) {
        serviceFilters.price.lte = query.maxPrice
      }
    }

    if (query.tags) {
      const tagList = query.tags.split(',').map((tag) => tag.trim())
      serviceFilters.tags = { hasSome: tagList }
    }

    if (query.location) {
      serviceFilters.OR = [
        { availableModes: { has: 'VIRTUAL' } },
        { AND: [{ availableModes: { has: 'IN_PERSON' }, city: query.location }] },
      ]
    }

    if (Object.keys(serviceFilters).length > 0) {
      whereClause.servicesProvided = { some: serviceFilters }
    }

    const experts = await prisma.expert.findMany({
      where: whereClause,
      include: { servicesProvided: { select: EXPERT_SERVICE_SELECT_FIELDS } },
      skip,
      take: limit,
    })

    if (query.sortBy) {
      const sortBy = query.sortBy
      experts.sort((a, b) => {
        const aValue = getSortValue(sortBy, a)
        const bValue = getSortValue(sortBy, b)
        return match(query.sortOrder)
          .with('desc', () => (bValue > aValue ? 1 : bValue < aValue ? -1 : 0))
          .with('asc', () => (aValue > bValue ? 1 : aValue < bValue ? -1 : 0))
          .exhaustive()
      })
    }

    const totalCount = await prisma.expert.count({ where: whereClause })

    return c.json({
      experts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filters: query,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to search experts - ${errorMessage}` }, 500)
  }
}

function getSortValue(sortBy: SortBy, expert: ExpertSearchResponse): string | number {
  return match(sortBy)
    .with('price', () => Math.min(...expert.servicesProvided.map((s) => s.price)))
    .with('name', () => expert.name || '')
    .with('rating', () => expert.avgRating || 0)
    .exhaustive()
}

export async function getExpertFromSlug(c: C, expertSlug: string) {
  try {
    const expert = await prisma.expert.findUnique({
      where: { slug: expertSlug },
      include: { servicesProvided: { select: EXPERT_SERVICE_SELECT_FIELDS } },
    })

    if (!expert) {
      return c.json({ error: 'Expert not found' }, 404)
    }

    return c.json({
      expert,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    return c.json({ error: `Failed to get expert details - ${errorMessage}` }, 500)
  }
}
