import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'
import TreatmentSection from './_components/treatment-section'
import AppointmentSection from './_components/appointment-section'
import DeepTmsSection from './_components/deep-tms-section'
import FAQSection from './_components/faq-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const { heroSetion, deepTmsSection, treatmentSection, appointmentSection, faqSection } = await payload.findGlobal({
    slug: 'home',
  })

  return (
    <div className="flexflex-col min-h-screen">
      <HeroSection data={heroSetion} />
      <DeepTmsSection data={deepTmsSection} />
      <TreatmentSection data={treatmentSection} />
      <AppointmentSection data={appointmentSection} />
      <FAQSection data={faqSection} />
    </div>
  )
}
