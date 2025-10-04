import * as fs from 'fs/promises'
import path from 'path'
import { ZodError } from 'zod'

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
    message = error.issues.length ? error.issues.map((e) => e.message).join(', ') : error.message
  }
  return message
}

export const SECOND = 1000
export const MINUTE = SECOND * 60
export const HOUR = MINUTE * 60
export const DAY = HOUR * 24

export async function getLogoAsBase64() {
  const logoPath = path.resolve(process.cwd(), 'src/static/assets/logo.png')
  const logoData = await fs.readFile(logoPath)
  return `data:image/png;base64,${logoData.toString('base64')}`
}
