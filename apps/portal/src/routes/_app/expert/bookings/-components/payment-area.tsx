import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'
import { getErrorMessage } from '@/lib/utils'
import type { Booking } from '@/lib/booking'

type PaymentAreaProps = {
  bookingId: string
  payment?: Booking['payments'][number]
}

export default function PaymentArea({ bookingId, payment }: PaymentAreaProps) {
  const queryClient = useQueryClient()

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (status: 'PENDING' | 'COMPLETED') => {
      const res = await honoClient.server.booking[':bookingId'].payment.status.$patch({
        param: { bookingId },
        json: { status },
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Payment status updated')
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
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

      <Button
        onClick={() => {
          updatePaymentStatusMutation.mutate(nextStatus)
        }}
        disabled={updatePaymentStatusMutation.isPending}
        variant="default"
        className="min-w-44"
        loading={updatePaymentStatusMutation.isPending}
      >
        `Mark as ${nextStatus}`
      </Button>
    </div>
  )
}
