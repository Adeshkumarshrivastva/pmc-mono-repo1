import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { dateToUtcMinutes, minutesToDate, toDDMMYYYY, toHHMMA, utcMinutesToLocalMinutes } from '@/lib/date'
import { honoClient } from '@/lib/hono-client'
import { Separator } from '@/components/ui/separator'
import { useBooking } from '../-hooks/use-booking'
import { cn } from '@/lib/utils'
import dayjs from '@/lib/dayjs'

type AvailableSlotsProps = {
  expertSlug: string
  serviceSlug: string
  onNext: () => void
}

export default function AvailableSlots({ expertSlug: expertId, serviceSlug: serviceId, onNext }: AvailableSlotsProps) {
  const { month, year, getSelectedDate, getSelectedSlot, setSelectedSlot } = useBooking()

  const selectedDate = getSelectedDate()
  const selectedSlot = getSelectedSlot()

  const getMonthlyAvailableSlotsQuery = useQuery({
    queryKey: ['monthly-available-slots', month, year],
    queryFn: () => fetchMonthlyAvailableSlots(expertId, serviceId, year, month),
  })

  const handleSelectedSlot = (startTime: number) => {
    const selectedSlot = minutesToDate(utcMinutesToLocalMinutes(startTime), selectedDate)
    setSelectedSlot(selectedSlot)
  }

  return (
    <div className="flex flex-col h-full">
      {match(getMonthlyAvailableSlotsQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <AvailableSlotsSkeleton />)
        .with({ status: 'error' }, () => <div>Error loading slots</div>)
        .with({ status: 'success' }, ({ data }) => {
          const slots = data.availability[toDDMMYYYY(selectedDate)] || []

          if (slots.length === 0) {
            return (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No slots available for this date</p>
                <p className="text-gray-400 text-xs mt-1">Please select another date</p>
              </div>
            )
          }

          return (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 flex flex-col space-y-2 overflow-auto">
                {slots.map((slot) => {
                  let isSelected = false

                  if (selectedSlot) {
                    const isSameDate = dayjs(selectedSlot).tz('Asia/Kolkata').isSame(dayjs(selectedDate), 'date')
                    const isSameTime = dateToUtcMinutes(selectedSlot) === slot.startTime
                    isSelected = isSameDate && isSameTime
                  }

                  return (
                    <Button
                      size="lg"
                      onClick={() => {
                        handleSelectedSlot(slot.startTime)
                      }}
                      variant="outline"
                      key={`slot-${selectedDate}-${slot.startTime}`}
                      className={cn(
                        'w-full',
                        isSelected ? 'bg-primary text-secondary hover:bg-primary hover:text-primary-foreground' : null,
                      )}
                    >
                      <div>{toHHMMA(minutesToDate(utcMinutesToLocalMinutes(slot.startTime), selectedDate))}</div>
                    </Button>
                  )
                })}
              </div>
              <Separator />
              <div className="flex justify-end p-4">
                <Button
                  disabled={!selectedSlot}
                  onClick={() => {
                    onNext()
                  }}
                  className="w-full sm:w-auto"
                >
                  Continue
                </Button>
              </div>
            </div>
          )
        })
        .otherwise(() => null)}
    </div>
  )
}

function AvailableSlotsSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-1 animate-pulse">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-9 bg-gray-200 rounded"
              style={{
                opacity: 0.5 + index * 0.1,
              }}
            />
          ))}
        </div>
      </div>
      <Separator />
      <div className="flex justify-end p-4">
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>
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
