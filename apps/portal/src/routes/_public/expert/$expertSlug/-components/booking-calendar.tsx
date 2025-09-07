import dayjs from '@/lib/dayjs'
import { Calendar } from '@/components/ui/calendar'
import { useBooking } from '../-hooks/use-booking'
import { today } from '@/lib/date'

export default function BookingCalendar() {
  const { month, year, getSelectedDate, setSelectedYear, setSelectedMonth, setSelectedDate, setSelectedSlot } =
    useBooking()

  return (
    <Calendar
      key={`${month}-${year}`}
      timeZone="Asia/Kolkata"
      mode="single"
      showOutsideDays={false}
      month={dayjs()
        .month(month - 1)
        .year(year)
        .toDate()}
      startMonth={dayjs().toDate()}
      selected={getSelectedDate()}
      disabled={(date) => dayjs(date).isBefore(dayjs(), 'day')}
      onDayClick={(date) => {
        setSelectedDate(date)
        setSelectedSlot(null)
      }}
      onNextClick={(date) => {
        setSelectedYear(date)
        setSelectedMonth(date)
        setSelectedDate(date)
      }}
      onPrevClick={(date) => {
        setSelectedYear(date)
        setSelectedMonth(date)
        if (dayjs(date).month() !== dayjs().month()) {
          setSelectedDate(date)
        } else {
          setSelectedDate(today)
        }
      }}
      className="w-full bg-transparent p-0 [--cell-size:--spacing(8)]"
    />
  )
}
