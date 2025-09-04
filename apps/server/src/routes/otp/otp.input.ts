import z from 'zod'

export const sendOtpInput = z.object({
  mobileNumber: z.string(),
})
export type SendOtpInput = z.infer<typeof sendOtpInput>

export const verifyOtpInput = z.object({
  otpId: z.string(),
  otp: z.string(),
})
export type VerifyOtpInput = z.infer<typeof verifyOtpInput>
