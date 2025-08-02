import { Toaster } from '@/components/ui/sonner'
import AppShell from './_components/app-shell'
import Providers from './_components/providers'
import './styles.css'
import Script from 'next/script'
import Head from 'next/head'

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
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <Toaster />
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              window.$zoho = window.$zoho || {};
              $zoho.salesiq = $zoho.salesiq || { ready: function() {} };
            `,
          }}
        />
        {/* 2️⃣  Zoho SalesIQ loader */}
        <Script
          id="zsiqscript"
          src="https://salesiq.zohopublic.in/widget?wc=siqb5ebcc68f690c8c01503c350f12ae3bf5a6fa772a9b447169c32afb30ac509a2"
          defer
        />
      </body>
    </html>
  )
}
