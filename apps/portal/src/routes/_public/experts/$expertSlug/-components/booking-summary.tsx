import { ArrowLeftIcon, UserIcon, ClockIcon, IndianRupeeIcon, CalendarIcon } from 'lucide-react'
import type { InferResponseType } from 'hono'
import type { HonoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { useBooking } from '../-hooks/use-booking'
import type { BookingMode } from '@/lib/booking'
import { Separator } from '@/components/ui/separator'
import { formatDateTimeRange } from '@/lib/date'
import dayjs from '@/lib/dayjs'

type BookingSummaryProps = {
  mode: BookingMode
  onBack: () => void
  service: GetServiceQueryResult
}

export default function BookingSummary({ mode, onBack, service }: BookingSummaryProps) {
  const { getSelectedSlot } = useBooking()
  const selectedSlot = getSelectedSlot()

  return (
    <div className="space-y-4">
      <div className="p-4">
        <Button
          variant="ghost"
          icon={<ArrowLeftIcon className="text-primary size-6" />}
          onClick={() => {
            onBack()
          }}
        />
      </div>

      <div className="space-y-8">
        <div className="space-y-2 px-6">
          <div className="text-xl font-semibold">{service.name}</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
              <UserIcon className="size-6 text-gray-400" />
            </div>
            <div className="text-gray-600">{service.expert.name}</div>
          </div>
        </div>
        <Separator className="hidden xl:block" />
        <div className="space-y-4 px-6">
          <div className="flex items-center gap-2">
            <ClockIcon className="size-5 text-gray-600" />
            <div className="text-gray-600 font-medium">{service.durationInMinutes} minutes</div>
          </div>
          {mode.type !== 'select_slot' && selectedSlot ? (
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-gray-600" />
              <div className="text-gray-600 font-medium">
                {formatDateTimeRange({
                  startDateTime: selectedSlot,
                  endDateTime: dayjs(selectedSlot).add(service.durationInMinutes, 'minutes').toDate(),
                })}
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <IndianRupeeIcon className="size-5 text-gray-600" />
            <div className="text-gray-600 font-medium">{service.price}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

type GetServiceQueryResult = InferResponseType<
  HonoClient['server']['experts'][':expertSlug']['service'][':serviceSlug']['$get'],
  200
>
