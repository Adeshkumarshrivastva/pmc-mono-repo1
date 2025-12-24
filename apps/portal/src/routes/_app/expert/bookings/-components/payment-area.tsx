import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'
import { getErrorMessage } from '@/lib/utils'
import { formatPaymentDate, getPaymentStatusColor } from '@/lib/payment'
import type { Booking } from '@/lib/booking'

type PaymentAreaProps = {
  bookingId: string
  payment?: Booking['payments'][number]
}

export default function PaymentArea({ bookingId, payment }: PaymentAreaProps) {
  const queryClient = useQueryClient()

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (status: 'PENDING' | 'COMPLETED') => {
      const res = await honoClient.server.experts[':bookingId'].payment.status.$patch({
        param: { bookingId },
        json: { status },
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Payment status updated')
      queryClient.invalidateQueries({ queryKey: ['get-expert-bookings'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  if (!payment) {
    return <p className="text-sm text-muted-foreground">No offline payment found.</p>
  }

  const nextStatus = payment.status === 'PENDING' ? 'COMPLETED' : 'PENDING'

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

      <div className="mt-6">
        <Button
          onClick={() => {
            updatePaymentStatusMutation.mutate(nextStatus)
          }}
          disabled={updatePaymentStatusMutation.isPending}
          variant="default"
          className="min-w-44"
          loading={updatePaymentStatusMutation.isPending}
        >
          Mark as {nextStatus}
        </Button>
      </div>
    </div>
  )
}
