import type { InferResponseType } from 'hono'
import type { HonoClient } from '@/lib/hono-client'

export const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
]

export type ExpertWithRelations = InferResponseType<HonoClient['server']['experts']['$get'], 200>['experts'][number]

export function generateSpecializationOptions(experts?: ExpertWithRelations[]) {
  if (!experts) {
    return []
  }

  const allExpertise = new Set<string>()

  experts.forEach((expert) => {
    if (expert.expertise && Array.isArray(expert.expertise)) {
      expert.expertise.forEach((expertise) => allExpertise.add(expertise))
    }
  })

  return Array.from(allExpertise)
    .map((expertise) => ({
      value: expertise,
      label: expertise.charAt(0).toUpperCase() + expertise.slice(1),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}
