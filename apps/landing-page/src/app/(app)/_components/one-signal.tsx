'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'

export default function OneSignalComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'c0256c27-396c-46a8-924b-701aee826b9a',
        safari_web_id: 'web.onesignal.auto.2bd24c9c-6b5e-41da-a209-1033c3319dfc',
      }).then(() => {
        OneSignal.Notifications.requestPermission()
      })
    }
  }, [])

  return null
}
