import type { InferResponseType } from 'hono/client'
import type { honoClient } from '@/lib/hono-client'

type PatientBookingsResponse = InferResponseType<(typeof honoClient)['server']['patient']['bookings']['$get'], 200>

type Booking = PatientBookingsResponse['bookings'][number]

type PaymentAreaProps = {
  payment?: Booking['payments'][number]
}

export default function PaymentArea({ payment }: PaymentAreaProps) {
  if (!payment) {
    return <p className="text-sm text-muted-foreground">No payment information available</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <strong>Amount:</strong> {payment.amountCurrency} {payment.amountPaid}
      </div>

      <div>
        <strong>Payment Status:</strong>
        <span className={`ml-2 ${payment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
          {payment.status}
        </span>
      </div>

      {payment.razorpayOrderId && (
        <div className="text-sm text-muted-foreground">
          <strong>Order ID:</strong> {payment.razorpayOrderId}
        </div>
      )}
    </div>
  )
}
