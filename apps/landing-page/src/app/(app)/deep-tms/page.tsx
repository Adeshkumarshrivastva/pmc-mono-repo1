import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'
import FAQSection from '../_components/faq-section'
import AppointmentSection from '../_components/appointment-section'
import WorkSection from './_components/work-section'

export default async function DeepTmsPage() {
  const payload = await getPayloadClient()
  const { deepTmsHeroSection, deepTmsWorkSection, faqSection, appointmentSection } = await payload.findGlobal({
    slug: 'deep-tms',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={deepTmsHeroSection} />
      <WorkSection data={deepTmsWorkSection} />
      <AppointmentSection data={appointmentSection} />
      <FAQSection data={faqSection} />
    </div>
  )
}
