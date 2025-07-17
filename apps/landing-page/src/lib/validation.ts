import { z } from 'zod/v4'

export const objectId = z.string().regex(/^[a-f\d]{24}$/i)
