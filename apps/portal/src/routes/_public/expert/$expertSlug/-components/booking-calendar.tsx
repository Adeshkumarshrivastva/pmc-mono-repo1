import type { UseQueryResult } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { match } from 'ts-pattern'
import { DATE_FORMAT, type MonthlyAvailableSlots } from '@/lib/booking'
import dayjs from '@/lib/dayjs'
import { today } from '@/lib/date'
import { Calendar } from '@/components/ui/calendar'
import { useBooking } from '../-hooks/use-booking'

type BookingCalendarProps = {
  getMonthlyAvailableSlotsQuery: UseQueryResult<MonthlyAvailableSlots>
}

export default function BookingCalendar({ getMonthlyAvailableSlotsQuery }: BookingCalendarProps) {
  const { month, year, getSelectedDate, setSelectedYear, setSelectedMonth, setSelectedDate, setSelectedSlot } =
    useBooking()

  const currentMonthDate = useMemo(
    () =>
      dayjs()
        .month(month - 1)
        .year(year)
        .toDate(),
    [month, year],
  )

  const handleDayClick = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      setSelectedSlot(null)
    },
    [setSelectedDate, setSelectedSlot],
  )

  const handleMonthNavigation = useCallback(
    (date: Date) => {
      setSelectedYear(date)
      setSelectedMonth(date)

      const isCurrentMonth = dayjs(date).isSame(dayjs(), 'month')
      setSelectedDate(isCurrentMonth ? today : date)
    },
    [setSelectedYear, setSelectedMonth, setSelectedDate],
  )

  return match(getMonthlyAvailableSlotsQuery)
    .returnType<React.ReactNode>()
    .with({ status: 'pending' }, () => {
      return <CalendarSkeleton />
    })
    .with({ status: 'error' }, () => {
      return <div>Error Loading slots</div>
    })
    .with({ status: 'success' }, ({ data }) => {
      return (
        <Calendar
          key={`${month}-${year}`}
          timeZone="Asia/Kolkata"
          mode="single"
          showOutsideDays={false}
          weekStartsOn={1}
          month={currentMonthDate}
          startMonth={dayjs().toDate()}
          selected={getSelectedDate()}
          disabled={(date) => {
            return data.availability[dayjs(date).format(DATE_FORMAT)]?.length === 0
          }}
          onDayClick={handleDayClick}
          onNextClick={handleMonthNavigation}
          onPrevClick={handleMonthNavigation}
          className="w-full bg-transparent p-0 [--cell-size:--spacing(8)]"
          classNames={{
            disabled: '[&>button]:font-light',
          }}
        />
      )
    })
    .otherwise(() => null)
}

function CalendarSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 bg-gray-200 rounded-md" />
        <div className="h-6 w-28 bg-gray-200 rounded-md" />
        <div className="h-8 w-8 bg-gray-200 rounded-md" />
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded"
            style={{
              opacity: 0.4 + i * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  )
}
