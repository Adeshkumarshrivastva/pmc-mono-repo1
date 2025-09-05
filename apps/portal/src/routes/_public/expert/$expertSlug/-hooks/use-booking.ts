import { useQueryState } from 'nuqs'
import { z } from 'zod'
import dayjs from '@/lib/dayjs'
import { toDDMMYYYY } from '@/lib/date'

const monthSchema = z.coerce.number().int().min(1).max(12)
const yearSchema = z.coerce.number().int().min(2000).max(2100)
const dateSchema = z
  .string()
  .regex(/^\d{2}-\d{2}-\d{4}$/)
  .refine(
    (dateStr) => {
      return dayjs(dateStr, 'DD-MM-YYYY', true).isValid()
    },
    { message: 'Invalid date' },
  )

export const useBooking = () => {
  const today = dayjs()

  const [month, setMonth] = useQueryState('month', {
    parse: (value) => {
      const parsedMonth = monthSchema.safeParse(value)
      return parsedMonth.success ? parsedMonth.data : today.month() + 1
    },
    serialize: String,
    defaultValue: today.month() + 1,
    clearOnDefault: false,
  })

  const [year, setYear] = useQueryState('year', {
    parse: (value) => {
      const parsedYear = yearSchema.safeParse(value)
      return parsedYear.success ? parsedYear.data : today.year()
    },
    serialize: String,
    defaultValue: today.year(),
    clearOnDefault: false,
  })

  const [date, setDate] = useQueryState('date', {
    parse: (value) => {
      const parsedDate = dateSchema.safeParse(value)
      return parsedDate.success ? parsedDate.data : toDDMMYYYY(today)
    },
    serialize: String,
    defaultValue: toDDMMYYYY(today),
    clearOnDefault: false,
  })

  const getSelectedDate = () => {
    return dayjs(date, 'DD-MM-YYYY').toDate()
  }

  const setSelectedDate = (newDate: Date) => {
    const currentDate = dayjs(date, 'DD-MM-YYYY')

    if (!dayjs(newDate).isSame(currentDate)) {
      setDate(toDDMMYYYY(newDate))
    }
  }

  const setSelectedYear = (newDate: Date) => {
    const newYear = dayjs(newDate).year()
    if (year !== newYear) {
      setYear(newYear)
    }
  }

  const setSelectedMonth = (newDate: Date) => {
    const newMonth = dayjs(newDate).month() + 1
    if (month !== newMonth) {
      setMonth(newMonth)
    }
  }

  return { month, year, getSelectedDate, setSelectedYear, setSelectedMonth, setSelectedDate }
}
