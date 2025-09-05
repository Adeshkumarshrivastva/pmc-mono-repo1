import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { minutesToHHMMA, toDDMMYYYY } from '@/lib/date'
import { useBooking } from '../-hooks/use-booking'
import { honoClient } from '@/lib/hono-client'

type AvailableSlotsProps = {
  expertSlug: string
  serviceSlug: string
}

export default function AvailableSlots({ expertSlug: expertId, serviceSlug: serviceId }: AvailableSlotsProps) {
  const { month, year, getSelectedDate } = useBooking()

  const selectedDate = toDDMMYYYY(getSelectedDate())
  const getMonthlyAvailableSlotsQuery = useQuery({
    queryKey: ['monthly-available-slots', month, year],
    queryFn: () => fetchMonthlyAvailableSlots(expertId, serviceId, year, month),
  })

  return (
    <div className="flex-1 border-b pb-4">
      {match(getMonthlyAvailableSlotsQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <div>Loading...</div>)
        .with({ status: 'error' }, () => <div>Error loading slots</div>)
        .with({ status: 'success' }, ({ data }) => {
          const slots = data.availability[selectedDate] || []

          if (slots.length === 0) {
            return (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No slots available for this date</p>
                <p className="text-gray-400 text-xs mt-1">Please select another date</p>
              </div>
            )
          }

          return (
            <div className="flex flex-col space-y-2">
              {slots.map((slot) => {
                return (
                  <Button variant="outline" key={`slot-${selectedDate}-${slot.startTime}`}>
                    <div>{minutesToHHMMA(slot.startTime)}</div>
                  </Button>
                )
              })}
            </div>
          )
        })
        .otherwise(() => null)}
    </div>
  )
}

const fetchMonthlyAvailableSlots = async (expertSlug: string, serviceSlug: string, year: number, month: number) => {
  const res = await honoClient.server.experts[':expertSlug']['monthly-available-slots'][':serviceSlug'].$get({
    param: { expertSlug, serviceSlug },
    query: { year: `${year}`, month: `${month}` },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch available slots')
  }
  const slots = await res.json()
  return slots
}
