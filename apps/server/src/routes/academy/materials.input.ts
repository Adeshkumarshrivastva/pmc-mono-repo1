import z from 'zod'

export const ALLOWED_MATERIAL_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const

export const uploadMaterialInput = z.object({
  file: z.file(),
  title: z.string().trim().optional(),
  // Rupees. Order 0 (free preview) and order 2+ of a sequential course
  // (earned by quiz, not paid) are priced 0 regardless of what's sent —
  // see uploadMaterial() in materials.service.ts.
  price: z.coerce.number().int().min(0).default(99),
  courseGroup: z.string().trim().optional(),
  order: z.coerce.number().int().min(0).optional(),
})

export const materialIdInput = z.object({
  materialId: z.string().min(1, 'Material id is required'),
})

export type UploadMaterialInput = z.infer<typeof uploadMaterialInput>
export type MaterialIdInput = z.infer<typeof materialIdInput>
