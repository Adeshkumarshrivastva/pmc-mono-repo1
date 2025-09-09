import { match } from 'ts-pattern'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, UserIcon, ClockIcon, IndianRupeeIcon, CalendarIcon } from 'lucide-react'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { useBooking } from '../-hooks/use-booking'
import type { BookingMode } from '@/lib/booking'
import { toHHMMA, utcDateToLocalDate } from '@/lib/date'
import dayjs from '@/lib/dayjs'

type BookingSummaryProps = {
  mode: BookingMode
  expertSlug: string
  serviceSlug: string
  onBack: () => void
}

export default function BookingSummary({ mode, expertSlug, serviceSlug, onBack }: BookingSummaryProps) {
  const getServiceQuery = useQuery({
    queryKey: ['expert-service', expertSlug, serviceSlug],
    queryFn: () => fetchExpertService(expertSlug, serviceSlug),
  })
  const { getSelectedSlot } = useBooking()
  const selectedSlot = getSelectedSlot()

  const formatSelectedSlot = (slot: Date, serviceDuration: number) => {
    const localDate = utcDateToLocalDate(slot)
    const startTime = dayjs(localDate)
    const endTime = startTime.add(serviceDuration, 'minute')
    const dateStr = startTime.format('dddd, MMMM D, YYYY')
    const startTimeStr = toHHMMA(startTime)
    const endTimeStr = toHHMMA(endTime)
    return `${startTimeStr} - ${endTimeStr}, ${dateStr}`
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        icon={<ArrowLeftIcon className="text-primary size-6" />}
        onClick={() => {
          onBack()
        }}
      />
      {match(getServiceQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <div>Loading...</div>)
        .with({ status: 'error' }, () => <div>Error loading service</div>)
        .with({ status: 'success' }, ({ data: service }) => {
          return (
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="text-xl font-semibold">{service.name}</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                    <UserIcon className="size-6 text-gray-400" />
                  </div>
                  <div className="text-gray-600">{service.expert.name}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-5 text-gray-600" />
                  <div className="text-gray-600 font-medium">{service.durationInMinutes} minutes</div>
                </div>
                {mode.type !== 'select_slot' && selectedSlot ? (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-5 text-gray-600" />
                    <div className="text-gray-600 font-medium">
                      {formatSelectedSlot(selectedSlot, service.durationInMinutes)}
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <IndianRupeeIcon className="size-5 text-gray-600" />
                  <div className="text-gray-600 font-medium">{service.price}</div>
                </div>
              </div>
            </div>
          )
        })
        .otherwise(() => null)}
    </div>
  )
}

const fetchExpertService = async (expertSlug: string, serviceSlug: string) => {
  const res = await honoClient.server.experts[':expertSlug'].service[':serviceSlug'].$get({
    param: { expertSlug, serviceSlug },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch service')
  }

  const service = await res.json()
  return service
}
