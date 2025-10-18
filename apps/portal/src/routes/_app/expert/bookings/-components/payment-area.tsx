import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'
import { getErrorMessage } from '@/lib/utils'

type PaymentAreaProps = {
  bookingId: string
}

export default function PaymentArea({ bookingId }: PaymentAreaProps) {
  const queryClient = useQueryClient()

  const {
    data: bookingResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const res = await honoClient.server.booking[':bookingId'].$get({
        param: { bookingId },
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    enabled: !!bookingId,
  })

  const booking = bookingResponse?.booking
  const offlinePayment = booking?.payments?.find((p) => p.paymentMode === 'OFFLINE')
  const paymentStatus = offlinePayment?.status || 'PENDING'

  const mutation = useMutation({
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

  if (isLoading) {
    return <div>Loading booking...</div>
  }

  if (error) {
    return <div>Error fetching booking: {getErrorMessage(error)}</div>
  }

  if (!offlinePayment) {
    return <p className="text-sm text-muted-foreground">No offline payment found.</p>
  }

  const nextStatus = paymentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING'

  return (
    <div className="space-y-4">
      <div>
        <strong>Amount:</strong> {offlinePayment.amountCurrency} {offlinePayment.amountPaid}
      </div>

      <div>
        <strong>Payment Status:</strong>
        <span className={`ml-2 ${paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
          {paymentStatus}
        </span>
      </div>

      <Button
        onClick={() => mutation.mutate(nextStatus)}
        disabled={mutation.isPending}
        variant="default"
        className="min-w-44"
      >
        {mutation.isPending ? 'Updating...' : `Mark as ${nextStatus}`}
      </Button>
    </div>
  )
}
