import type { UseQueryResult } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { dateToUtcMinutes, minutesToDate, toDDMMYYYY, toHHMMA, utcMinutesToLocalMinutes } from '@/lib/date'
import { Separator } from '@/components/ui/separator'
import { useBooking } from '../-hooks/use-booking'
import { cn } from '@/lib/utils'
import dayjs from '@/lib/dayjs'
import type { MonthlyAvailableSlots } from '@/lib/booking'

type AvailableSlotsProps = {
  onNext: () => void
  getMonthlyAvailableSlotsQuery: UseQueryResult<MonthlyAvailableSlots>
}

export default function AvailableSlots({ onNext, getMonthlyAvailableSlotsQuery }: AvailableSlotsProps) {
  const { getSelectedDate, getSelectedSlot, setSelectedSlot } = useBooking()

  const selectedDate = getSelectedDate()
  const selectedSlot = getSelectedSlot()

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

          return (
            <div className="flex flex-col h-full">
              <div className="h-full flex-1 p-6 flex flex-col space-y-4 xl:overflow-hidden">
                <div> {dayjs(selectedDate).format('dddd, MMMM D')}</div>
                <div className="space-y-2 h-full flex-1 overflow-auto pb-20 xl:pb-0">
                  {slots.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No slots available for this date</p>
                      <p className="text-gray-400 text-xs mt-1">Please select another date</p>
                    </div>
                  ) : (
                    slots.map((slot) => {
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
                            isSelected
                              ? 'bg-primary text-secondary hover:bg-primary hover:text-primary-foreground'
                              : null,
                          )}
                        >
                          <div>{toHHMMA(minutesToDate(utcMinutesToLocalMinutes(slot.startTime), selectedDate))}</div>
                        </Button>
                      )
                    })
                  )}
                </div>
              </div>
              <div className="fixed xl:static bottom-0 left-0 right-0 bg-background border-t xl:border-t-0 xl:bg-transparent">
                <Separator className="hidden xl:block" />
                <div className="flex justify-end p-4">
                  <Button
                    disabled={!selectedSlot}
                    onClick={() => {
                      onNext()
                    }}
                    className="w-full sm:w-auto xl:w-auto"
                  >
                    Continue
                  </Button>
                </div>
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
      <div className="fixed xl:static bottom-0 left-0 right-0 bg-background border-t xl:border-t-0 xl:bg-transparent">
        <Separator className="hidden xl:block" />
        <div className="flex justify-end p-4">
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  )
}
