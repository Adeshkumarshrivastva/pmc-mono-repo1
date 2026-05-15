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

  console.log('=== POPUP DEBUG ===')
  console.log('Total popups found:', popupsData.docs.length)
  console.log('Current date:', new Date().toISOString())
  
  if (popupsData.docs.length > 0) {
    console.log('First popup:', {
      id: popupsData.docs[0].id,
      name: popupsData.docs[0].popupName,
      isActive: popupsData.docs[0].isActive,
    })
  }
  
  console.log('===================')

  if (popupsData.docs.length === 0) {
    console.log('No active popups found!')
    return null
  }

  // Pass all popups to the dialog component
  return <PopupNotificationDialog popups={popupsData.docs as PopupNotification[]} />
}
