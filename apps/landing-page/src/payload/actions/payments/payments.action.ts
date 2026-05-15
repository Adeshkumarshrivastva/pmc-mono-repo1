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
    console.log('Creating Razorpay order with:', { amount, currency })
    
    const order = await razorpay.orders.create({ 
      amount: amount * 100, 
      currency, 
      receipt: `order_${Date.now()}` 
    })
    
    console.log('Razorpay order created:', order)
    
    if (!order) {
      throw new Error('Failed to create order')
    }

    return {
      orderId: order.id,
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create order: ${error.message}`)
    }
    throw new Error('Failed to create order')
  }
}
