import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'
import TreatmentSection from './_components/treatment-section'
import DeepTmsSection from './_components/deep-tms-section'
import FAQSection from './_components/faq-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const { heroSetion, treatmentSection, deepTmsSection, faqSection } = await payload.findGlobal({ slug: 'home' })

  return (
    <div className="flexflex-col min-h-screen">
      <HeroSection data={heroSetion} />
      <DeepTmsSection data={deepTmsSection} />
      <TreatmentSection data={treatmentSection} />
      <FAQSection data={faqSection} />
    </div>
  )
}
