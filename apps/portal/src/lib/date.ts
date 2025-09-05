import type { Dayjs } from 'dayjs'
import dayjs from './dayjs'

export const today = dayjs().toDate()

export const toDDMMYYYY = (date: Date | Dayjs) => {
  if (dayjs.isDayjs(date)) {
    return date.format('DD-MM-YYYY')
  } else {
    return dayjs(date).format('DD-MM-YYYY')
  }
}
