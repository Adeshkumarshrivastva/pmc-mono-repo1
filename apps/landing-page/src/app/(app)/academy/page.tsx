import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'
import WhyChooseSection from './_components/why-choose'
import ServicesSection from './_components/services-section'
import FAQSection from './_components/faq-section'

export default async function Page() {
  const payload = await getPayloadClient()
  const { heroSection, whyChoose, servicesSection, faqSection } = await payload.findGlobal({
    slug: 'academy',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={heroSection} />
      <WhyChooseSection data={whyChoose} />
      <ServicesSection data={servicesSection} />
      <FAQSection data={faqSection} />
    </div>
  )
}
