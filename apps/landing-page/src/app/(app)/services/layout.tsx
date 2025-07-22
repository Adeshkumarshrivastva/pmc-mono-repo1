import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import AppointmentSection from '../_components/appointment-section'
import FAQSection from '../_components/faq-section'

export default async function RootLayout({ children }: React.PropsWithChildren) {
  const payload = await getPayloadClient()

  const { appointmentSection, faqSection } = await payload.findGlobal({
    slug: 'home',
  })
  const services = await getServices({})

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      {children}
      <AppointmentSection data={appointmentSection} services={services.docs} />
      <FAQSection data={faqSection} />
    </div>
  )
}
