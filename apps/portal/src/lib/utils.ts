import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

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
