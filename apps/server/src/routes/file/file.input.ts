import z from 'zod'

export const uploadFileInput = z.object({
  file: z.file(),
})

export type UploadFileInput = z.infer<typeof uploadFileInput>
