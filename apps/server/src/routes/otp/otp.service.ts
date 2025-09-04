import { customAlphabet } from 'nanoid'
import dayjs from '../../lib/dayjs'
import { prisma } from '../../lib/db'
import { getErrorMessage } from '../../lib/utils'
import type { SendOtpInput, VerifyOtpInput } from './otp.input'
import { rootLogger } from '../../lib/logger'
import { env } from '../../lib/env'

const nanoid = customAlphabet('1234567890', 6)
const DEV_OTP = '123456'

export async function sendOtp(input: SendOtpInput) {
  try {
    await prisma.$transaction(async (prisma) => {
      const existingOtp = await prisma.otp.findFirst({
        where: {
          mobileNumber: input.mobileNumber,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (existingOtp) {
        if (dayjs(existingOtp.expiresAt).isBefore(dayjs())) {
          await prisma.otp.delete({ where: { id: existingOtp.id } })
        } else {
          throw new Error('OTP already sent! Use resend otp method.')
        }
      }
    })

    const otp = env.NODE_ENV === 'development' ? DEV_OTP : nanoid()
    const createdOtp = await prisma.otp.create({
      data: {
        otp,
        expiresAt: dayjs().add(5, 'minute').toDate(),
        mobileNumber: input.mobileNumber,
      },
    })

    rootLogger.info(`OTP sent successfully to ${createdOtp.mobileNumber}: otp is ${createdOtp.otp}`)
    return createdOtp
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    throw new Error(errorMessage)
  }
}

export async function verifyOtp(input: VerifyOtpInput) {
  try {
    const otp = await prisma.otp.findUnique({
      where: { id: input.otpId },
    })
    if (!otp) {
      throw new Error('OTP expired or not found')
    }

    const isExpired = dayjs(otp.expiresAt).isBefore(dayjs())
    if (isExpired) {
      await prisma.otp.delete({ where: { id: otp.id } })
      throw new Error('OTP expired')
    }
    if (input.otp !== otp.otp) {
      throw new Error('Invalid OTP')
    }

    rootLogger.info(`OTP verified successfully for mobile: ${otp.mobileNumber}`)
    return { success: true }
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    throw new Error(errorMessage)
  }
}
