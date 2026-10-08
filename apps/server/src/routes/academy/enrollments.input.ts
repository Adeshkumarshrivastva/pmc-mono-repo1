import z from 'zod'

export const enrollInput = z.object({
  courseId: z.string().min(1, 'Course id is required'),
})

export const updateProgressInput = z.object({
  progress: z.number().min(0).max(100),
})

export const enrollmentIdInput = z.object({
  enrollmentId: z.string().min(1, 'Enrollment id is required'),
})

export type EnrollInput = z.infer<typeof enrollInput>
export type UpdateProgressInput = z.infer<typeof updateProgressInput>
export type EnrollmentIdInput = z.infer<typeof enrollmentIdInput>
