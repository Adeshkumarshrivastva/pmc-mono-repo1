import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CURRENCY_CONFIG: Record<string, { symbol: string }> = {
  INR: { symbol: '₹' },
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
  GBP: { symbol: '£' },
}

export function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`
  }

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`
  }

  if (phone.startsWith('+91')) {
    return phone
  }

  return phone
}
