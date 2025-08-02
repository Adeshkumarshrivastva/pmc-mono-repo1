import Script from 'next/script'
import { Toaster } from '@/components/ui/sonner'
import AppShell from './_components/app-shell'
import Providers from './_components/providers'
import './styles.css'

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
        <Script id="razorpay-checkout" src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  )
}
