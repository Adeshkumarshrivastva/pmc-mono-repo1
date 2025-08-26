import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, defaultMessage = 'Something went wrong. Please try again later') {
  let message = defaultMessage

  if (error instanceof ZodError) {
    message = error.message
  } else if (error instanceof Error) {
    message = error.message
  }

  return message
}

export function fetchWithCredentials(...args: Parameters<typeof fetch>) {
  if (args[1]) {
    args[1].credentials = 'include'
  } else {
    args[1] = { credentials: 'include' }
  }

  return fetch(...args)
}
