import { getPayloadClient } from '@/lib/payload'
import PopupNotificationDialog from './popup-notification-dialog'
import type { PopupNotification } from '@/payload/types'

export default async function PopupNotification() {
  const payload = await getPayloadClient()

  // Get all active popups
  const popupsData = await payload.find({
    collection: 'popup-notifications',
    where: {
      isActive: {
        equals: true,
      },
    },
    limit: 2, // Maximum 2 popups side by side
  })

  if (popupsData.docs.length === 0) {
    return null
  }

  return <PopupNotificationDialog popups={popupsData.docs as PopupNotification[]} />
}
