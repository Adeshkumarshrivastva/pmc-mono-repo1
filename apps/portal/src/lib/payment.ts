import dayjs from '@/lib/dayjs'

export function formatPaymentDate(dateString: string) {
  return dayjs(dateString).format('MMMM D, YYYY, hh:mm A')
}

export function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'FAILED':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
