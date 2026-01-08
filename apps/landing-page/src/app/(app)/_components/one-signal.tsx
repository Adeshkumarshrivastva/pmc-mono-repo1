'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'

export default function OneSignalComponent() {
  useEffect(() => {
    const initOneSignal = async () => {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        safari_web_id: 'web.onesignal.auto.2bd24c9c-6b5e-41da-a209-1033c3319dfc',
        serviceWorkerParam: {
          scope: '/',
        },
        serviceWorkerPath: 'OneSignalSDKWorker.js',
      })
      await OneSignal.Notifications.requestPermission()
    }
    if (typeof window !== 'undefined') {
      initOneSignal()
    }
  }, [])

  return null
}
