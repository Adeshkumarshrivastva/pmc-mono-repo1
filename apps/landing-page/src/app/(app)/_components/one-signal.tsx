'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'

// The OneSignal app is registered for this origin only; init on any other origin
// (localhost, staging, www) throws "Can only be used on: https://positivemindcare.com".
const ONESIGNAL_ALLOWED_ORIGIN = 'https://positivemindcare.com'

export default function OneSignalComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin === ONESIGNAL_ALLOWED_ORIGIN) {
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
