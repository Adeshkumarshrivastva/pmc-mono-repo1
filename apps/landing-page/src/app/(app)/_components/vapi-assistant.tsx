'use client'

export default function VapiAssistant() {
  return (
    <div id="vapi-support-container">
      {/* @ts-expect-error */}
      <vapi-widget
        public-key="204484b4-ae72-49a4-be8b-5e5180bf4b22"
        assistant-id="b612b606-3d8e-443f-8461-c0757977c4ac"
        mode="voice"
        theme="dark"
        base-bg-color="#000000"
        accent-color="#14B8A6"
        cta-button-color="#000000"
        cta-button-text-color="#FFFFFF"
        border-radius="medium"
        size="compact"
        position="bottom-left"
        title="TALK WITH SANDRA"
        start-button-text="Start"
        end-button-text="End Call"
        cta-title="TALK WITH SANDRA"
        cta-subtitle="Need Support? Connect With Us"
        chat-first-message="Hey, How can I help you today?"
        chat-placeholder="Type your message..."
        voice-show-transcript="true"
        consent-required="false"
      />

      <style jsx global>{`
        vapi-widget {
          z-index: 999999 !important; /* Ensure it stays above AppShell/Zoho */
          position: fixed;
          bottom: 20px;
          left: 20px;
        }
      `}</style>
    </div>
  )
}
