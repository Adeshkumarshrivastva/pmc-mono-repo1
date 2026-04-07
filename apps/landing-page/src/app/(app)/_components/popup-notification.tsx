import { getPayloadClient } from '@/lib/payload'
import PopupNotificationDialog from './popup-notification-dialog'
import type { PopupNotification } from '@/payload/types'

export default async function PopupNotification() {
  const payload = await getPayloadClient()

  const popupsData = await payload.find({
    collection: 'popup-notifications',
    where: {
      isActive: {
        equals: true,
      },
      startDate: {
        less_than_equal: new Date().toISOString(),
      },
      endDate: {
        greater_than_equal: new Date().toISOString(),
      },
    },
  })

  if (popupsData.docs.length === 0) {
    return null
  }

  return (
    <>
      {popupsData.docs.map((popup: PopupNotification) => (
        <PopupNotificationDialog key={popup.id} {...popup} />
      ))}
    </>
  )
}
