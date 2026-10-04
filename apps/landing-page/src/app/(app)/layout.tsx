import Script from 'next/script'
import { GoogleTagManager } from '@next/third-parties/google'
import { Toaster } from '@/components/ui/sonner'
import AppShell from './_components/app-shell'
import Providers from './_components/providers'
import FloatingWhatsapp from './_components/floating-whatsapp'
import OneSignalComponent from './_components/one-signal'
import QuikwitChatWidget from './_components/quikwit-chat-widget'
import '@/app/styles.css'

export const metadata = {
  description:
    'Most Advance treatment for Depression, Anxiety, OCD, Brain Stroke and Personalized Online Counselling Services at Positive Mind Care.',
  title: 'Positive Mind Care',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default async function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="AW-11360558230" />
      <body>
        <OneSignalComponent />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <Toaster />
        <FloatingWhatsapp />
        <QuikwitChatWidget />
        {/* Zoho SalesIQ loader — disabled (kept in code, not removed).
            Was popping open its own "Sandra" chat panel over the UI; only
            WhatsApp + Dr Shy should show as chat launchers, so these scripts
            are commented out rather than loaded.
        <Script
          id="zoho-salesiq-init"
          defer
          dangerouslySetInnerHTML={{
            __html: `
              window.$zoho = window.$zoho || {};
              $zoho.salesiq = $zoho.salesiq || { ready: function() {} };
            `,
          }}
        />
        <Script
          id="zsiqscript"
          src="https://salesiq.zohopublic.in/widget?wc=siqb5ebcc68f690c8c01503c350f12ae3bf5a6fa772a9b447169c32afb30ac509a2"
          defer
        />
        */}
      </body>
    </html>
  )
}
