'use client'

import { useEffect } from 'react'
import Script from 'next/script'

// Loads the Quikwit chat widget (Dr Shy) as a custom element. `minimized` keeps it
// collapsed to its small launcher icon on load; the "Dr Shy" navbar button also calls
// its own `.open()` method to expand it directly.
//
// The visible launcher bubble (`.circle-fab`, 56x56) lives inside the widget's shadow DOM
// and gets its `position: fixed; right: 20px; bottom: 20px` from a Constructable
// StyleSheet the widget adopts — not a plain <style> tag, so appending our own <style>
// into the shadow root never took effect (nothing to override, wrong mechanism). We set
// the position directly on the element's own inline style instead, which beats an
// adopted stylesheet rule outright, and re-assert it on an interval in case the widget
// re-renders and resets it. Positioned clear of FloatingWhatsapp's icon (fixed at
// right-16, i.e. 64px inset, +8px margin at sm+).
export default function QuikwitChatWidget() {
  useEffect(() => {
    const host = document.querySelector('chat-widget') as HTMLElement | null
    if (!host) return

    const applyPosition = () => {
      const fab = host.shadowRoot?.querySelector('.circle-fab') as HTMLElement | null
      if (!fab) return

      // FloatingWhatsapp's icon only leaves 64px (mobile) / 72px (sm+) of clearance from the
      // true right edge, and this fab is 56px wide — flush-right is the most separation
      // achievable without pushing it off-screen (~8px / ~16px gap respectively).
      const isDesktop = window.innerWidth >= 640
      fab.style.setProperty('right', '0px', 'important')
      fab.style.setProperty('bottom', isDesktop ? '8px' : '16px', 'important')
    }

    applyPosition()
    const interval = setInterval(applyPosition, 300)
    window.addEventListener('resize', applyPosition)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', applyPosition)
    }
  }, [])

  return (
    <>
      <Script src="https://cdn.quikwit.chat/chat-widget-v2.js" type="module" strategy="afterInteractive" />
      {/* @ts-expect-error - custom element not typed */}
      <chat-widget api-key="OmZN-W0C9fPwp5ZqOCCatSRhGP7ESw3xZ7YbvCBhLBs=" minimized />
    </>
  )
}

export function openQuikwitChatWidget() {
  if (typeof document === 'undefined') return
  const widget = document.querySelector('chat-widget') as (Element & { open?: () => void }) | null
  widget?.open?.()
}
