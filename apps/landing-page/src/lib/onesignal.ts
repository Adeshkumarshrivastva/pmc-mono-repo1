import type { Blog } from '../payload/types'
import { getURLFromMedia } from '@/payload/utils'

export const sendBlogNotification = async (blog: Blog) => {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  const apiKey = process.env.ONESIGNAL_APP_API_KEY

  if (!appId || !apiKey) {
    console.error('OneSignal App ID or API Key is missing')
    return
  }

  const imageUrl = getURLFromMedia(blog?.image ?? '')

  const payload = {
    app_id: appId,
    headings: { en: 'New Blog Posted!' },
    contents: { en: blog.title },
    url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${blog.slug}`,
    included_segments: ['All'],
    chrome_web_image: { en: imageUrl },
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('Error sending OneSignal notification:', error)
  }
}
