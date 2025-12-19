import type { InferResponseType } from 'hono/client'
import type { honoClient } from '@/lib/hono-client'
import { formatPaymentDate, getPaymentStatusColor } from '@/lib/payment'

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
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Amount</p>
          <p className="text-2xl font-bold">
            {payment.amountCurrency} {payment.amountPaid?.toLocaleString()}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
          <div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getPaymentStatusColor(payment.status)}`}
            >
              {payment.status}
            </span>
          </div>
        </div>

        {payment.paymentMode && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Payment Mode</p>
            <p className="text-base font-medium capitalize">{payment.paymentMode.toLowerCase()}</p>
          </div>
        )}

        {payment.createdAt && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
            <p className="text-base font-medium">{formatPaymentDate(payment.createdAt)}</p>
          </div>
        )}
      </div>

      {payment.razorpayOrderId && (
        <div className="mt-4 border-t pt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm">{payment.razorpayOrderId}</p>
          </div>
        </div>
      )}
    </div>
  )
}
