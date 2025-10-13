import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'
import type { InferResponseType } from 'hono'
import { type HonoClient } from '@/lib/hono-client'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, defaultMessage = 'Something went wrong. Please try again') {
  let errorMessage = defaultMessage
  if (error instanceof ZodError) {
    errorMessage = error.issues.length ? error.issues.map((e) => e.message).join(', ') : error.message
  } else if (error instanceof Error) {
    errorMessage = error.message
  }
  return errorMessage
}

export function fetchWithCredentials(...args: Parameters<typeof fetch>) {
  if (args[1]) {
    args[1].credentials = 'include'
  } else {
    args[1] = { credentials: 'include' }
  }

  return fetch(...args)
}

export function invariant(cond: unknown, message: string): asserts cond {
  if (!cond) {
    throw new Error(message)
  }
}

export function downloadBlobAsFile(blob: Blob, filename = 'file') {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
]

type ExpertWithRelations = InferResponseType<HonoClient['server']['experts']['$get'], 200>['experts'][number]

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
