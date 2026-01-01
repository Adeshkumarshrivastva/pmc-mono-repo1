import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import ContactSection from '../_components/contact-section'
import FAQSection from '../_components/faq-section'

export default async function RootLayout({ children }: React.PropsWithChildren) {
  const payload = await getPayloadClient()

  const { contactSection, faqSection } = await payload.findGlobal({
    slug: 'home',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      {children}
      <ContactSection data={contactSection} />
      <FAQSection data={faqSection} />
    </div>
  )
}
