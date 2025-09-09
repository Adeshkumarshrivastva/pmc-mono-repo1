import z from 'zod'

export const getPatientByMobileNumberInput = z.object({
  mobileNumber: z.string(),
})
export type GetPatientByMobileNumberInput = z.infer<typeof getPatientByMobileNumberInput>

export const verifyPatientInput = z.object({
  otp: z.string(),
})
export type VerifyPatientInput = z.infer<typeof verifyPatientInput>
