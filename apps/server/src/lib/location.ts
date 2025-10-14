import type { JSONValue } from 'hono/utils/types'
import z from 'zod'

export const inPersonLocationSchema = z
  .object({
    address: z.string(),
    googleMapLink: z.string().nullable(),
  })
  .nullable()

export function getInPersonLocation(location: JSONValue) {
  const inPersonLocation = inPersonLocationSchema.parse(location)

  return `${inPersonLocation?.address}
${inPersonLocation?.googleMapLink ? `\nGoogle Map Link: ${inPersonLocation.googleMapLink}` : ''}`
}

// TODO: We will change it to discriminated union when we support multiple virtual location types
export const virtualLocationSchema = z
  .object({
    type: z.literal('google_meet'),
    meetLink: z.string(),
  })
  .nullable()

export function getVirtualMeetLink(location: JSONValue) {
  const virtualLocation = virtualLocationSchema.parse(location)

  return virtualLocation?.meetLink
}
