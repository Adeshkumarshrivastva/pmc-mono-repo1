import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleBooking() {
  document.getElementById('appointement-section')?.scrollIntoView({ behavior: 'smooth' })
}
