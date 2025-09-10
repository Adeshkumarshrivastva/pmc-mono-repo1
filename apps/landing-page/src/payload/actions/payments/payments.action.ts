'use server'

import Razorpay from 'razorpay'
import { env } from '@/env'
import type { CreateOrderInput } from './payments.input'

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

export async function createOrder({ amount, currency = 'INR' }: CreateOrderInput) {
  try {
    const order = await razorpay.orders.create({ amount: amount * 100, currency, receipt: `order_${Date.now()}` })
    if (!order) {
      throw new Error('Failed to create order')
    }

    return {
      orderId: order.id,
    }
  } catch (error) {
    console.error('Error creating order:', error)
    throw new Error('Failed to create order')
  }
}
