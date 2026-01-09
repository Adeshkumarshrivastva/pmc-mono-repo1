'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'

export default function OneSignalComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      runOneSignal()
    }
  }, [])

  async function runOneSignal() {
    try {
      await OneSignal.init({
        appId: 'c0256c27-396c-46a8-924b-701aee826b9a',
        safari_web_id: 'web.onesignal.auto.2bd24c9c-6b5e-41da-a209-1033c3319dfc',
      })

      await OneSignal.Slidedown.promptPush()

      console.log('OneSignal initialized successfully')
    } catch (error) {
      console.error('OneSignal initialization error:', error)
    }
  }

  return null
}
