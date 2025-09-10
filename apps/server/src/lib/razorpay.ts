import Razorpay from 'razorpay'
import { config } from '../config'

export const razorpayInstance = new Razorpay({
  key_id: config.payment.razorpay.keyId,
  key_secret: config.payment.razorpay.keySecret,
})
