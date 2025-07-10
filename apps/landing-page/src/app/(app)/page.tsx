import { getPayloadClient } from '@/lib/payload'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import HeroSection from './_components/hero-section'
import TreatmentSection from './_components/treatment-section'
import AppointmentSection from './_components/appointment-section'
import DeepTmsSection from './_components/deep-tms-section'
import FAQSection from './_components/faq-section'
import WhyChooseSection from './_components/why-choose-section'
import { TestimonialSection } from './_components/testimonial-section'
import PackagesSection from './_components/packages-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const {
    heroSetion,
    deepTmsSection,
    treatmentSection,
    appointmentSection,
    faqSection,
    whyChooseSection,
    testimonialSection,
    packagesSection,
  } = await payload.findGlobal({
    slug: 'home',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={heroSetion} />
      <DeepTmsSection data={deepTmsSection} />
      <TreatmentSection data={treatmentSection} />
      <WhyChooseSection data={whyChooseSection} />
      <TestimonialSection data={testimonialSection} />
      <PackagesSection data={packagesSection} />
      <AppointmentSection data={appointmentSection} />
      <FAQSection data={faqSection} />
    </div>
  )
}
