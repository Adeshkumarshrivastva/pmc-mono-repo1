import { ZodError } from 'zod/v4'

export function invariant(cond: unknown, message: string): asserts cond {
  if (!cond) {
    throw new Error(message)
  }
}

export function getErrorMessage(error: unknown, defaultMessage = 'Something went wrong. Please try again later') {
  let message = defaultMessage
  if (error instanceof Error) {
    message = error.message
  } else if (error instanceof ZodError) {
    message = error.message
  }
  return message
}
