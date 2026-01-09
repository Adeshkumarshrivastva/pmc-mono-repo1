import type { Blog } from '../payload/types'
import { env } from '@/env'
import { getURLFromMedia } from '@/payload/utils'

export const sendBlogNotification = async (blog: Blog) => {
  const appId = 'c0256c27-396c-46a8-924b-701aee826b9a'
  const apiKey = env.ONESIGNAL_APP_API_KEY

  if (!appId || !apiKey) {
    console.error('OneSignal App ID or API Key is missing')
    return
  }

  const payload = {
    app_id: appId,
    headings: { en: 'New Blog Posted!' },
    contents: { en: blog.title },
    url: `${env.NEXT_PUBLIC_API_BASE_URL}/blogs/${blog.slug}`,
    included_segments: ['All'],
    chrome_web_image: { en: getURLFromMedia(blog?.image ?? '') },
  }

  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
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
