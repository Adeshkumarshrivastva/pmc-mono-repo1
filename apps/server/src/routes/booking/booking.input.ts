import z from 'zod'

export const initiatePatientAuthInput = z.object({
  phoneNumber: z.string(),
})
export type InitiatePatientAuthInput = z.infer<typeof initiatePatientAuthInput>

export const verifyPatientInput = z.object({
  otp: z.string(),
})
export type VerifyPatientInput = z.infer<typeof verifyPatientInput>
